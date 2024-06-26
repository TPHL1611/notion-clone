import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const archive = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not Authenticated");
        }
        const userID = identity.subject;
        const existingDocument = await ctx.db.get(args.id);
        if (!existingDocument) {
            throw new Error("Not document archive found!");
        }
        if (existingDocument.userId !== userID) {
            throw new Error("Unauthorized");
        }

        //Xửu lý tất cả các document con sang archive nếu document cha archive
        const recursiveArchive = async (documentId: Id<"documents">) => {
            // Get all child document in db
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parent", (q) =>
                    q.eq("userId", userID).eq("parentDocument", documentId)
                )
                .collect();
            //Loop all chilren
            for (const child of children) {
                //Set isArchived to be true
                await ctx.db.patch(child._id, {
                    isArchived: true,
                });
                await recursiveArchive(child._id);
            }
        };

        //Set document isArchived to true
        const document = await ctx.db.patch(args.id, {
            isArchived: true,
        });

        recursiveArchive(args.id);

        return document;
    },
});

export const get = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        //Kiểm tra request có người dùng ?
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const documents = await ctx.db.query("documents").collect();
        return documents;
    },
});

export const getSidebar = query({
    args: {
        parentDocument: v.optional(v.id("documents")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not Authenticated");
        }
        const userID = identity.subject;
        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user_parent", (q) =>
                q.eq("userId", userID).eq("parentDocument", args.parentDocument)
            )
            .filter((q) => q.eq(q.field("isArchived"), false))
            .order("desc")
            .collect();
        return documents;
    },
});

export const getTrash = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        //Kiểm tra request có người dùng ?
        if (!identity) {
            throw new Error("Not authenticated");
        }
        //Get userID
        const userId = identity.subject;

        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isArchived"), true))
            .order("desc")
            .collect();

        return documents;
    },
});

export const getSearch = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        //Kiểm tra request có người dùng ?
        if (!identity) {
            throw new Error("Not authenticated");
        }
        //Get userID
        const userId = identity.subject;

        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isArchived"), false))
            .order("desc")
            .collect();

        return documents;
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        parentDocument: v.optional(v.id("documents")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        //Kiểm tra request có người dùng ?
        if (!identity) {
            throw new Error("Not authenticated");
        }
        //Get userID
        const userId = identity.subject;
        // Insert data to db
        const document = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            isArchived: false,
            isPublished: false,
        });
        return document;
    },
});

export const restore = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        //Kiểm tra request có người dùng ?
        if (!identity) {
            throw new Error("Not authenticated");
        }
        //Get userID
        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);
        if (!existingDocument) {
            throw new Error("Not document found");
        }
        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const recursiveRestore = async (documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parent", (q) =>
                    q.eq("userId", userId).eq("parentDocument", documentId)
                )
                .collect();
            for (const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: false,
                });

                await recursiveRestore(child._id);
            }
        };

        const options: Partial<Doc<"documents">> = {
            isArchived: false,
        };
        if (existingDocument.parentDocument) {
            const parent = await ctx.db.get(existingDocument.parentDocument);
            if (parent?.isArchived) {
                options.parentDocument = undefined;
            }
        }
        const document = await ctx.db.patch(args.id, options);
        recursiveRestore(args.id);
        return document;
    },
});

export const remove = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        //Kiểm tra request có người dùng ?
        if (!identity) {
            throw new Error("Not authenticated");
        }
        //Get userID
        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);
        if (!existingDocument) {
            throw new Error("Not document found");
        }
        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const document = await ctx.db.delete(args.id);
        return document;
    },
});

export const getById = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        const document = await ctx.db.get(args.documentId);
        if (!document) {
            throw new Error("Not document found");
        }
        if (document.isPublished && !document.isArchived) {
            return document;
        }

        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;
        if (document.userId !== userId) {
            throw new Error("Unauthorized");
        }
        return document;
    },
});

export const update = mutation({
    args: {
        id: v.id("documents"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;
        //Phân tách object thông tin gửi lên với toán tử rest
        // Thông tin cần nhất là id, các thông tin còn lại nếu không có gì khác sẽ được giữ nguyên
        const { id, ...rest } = args;
        const existingDocument = await ctx.db.get(args.id);
        if (!existingDocument) {
            throw new Error("Not document found");
        }
        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }
        //Cập nhật data trong database và return
        const document = await ctx.db.patch(args.id, {
            ...rest,
        });
        return document;
    },
});

export const removeIcon = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;
        const existingDocument = await ctx.db.get(args.id);
        if (!existingDocument) {
            throw new Error("Not document found");
        }
        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }
        const document = await ctx.db.patch(args.id, {
            icon: undefined,
        });
        return document;
    },
});

export const removeCoverImage = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }
        const userId = identity.subject;
        const existingDocument = await ctx.db.get(args.id);
        if (!existingDocument) {
            throw new Error("Not document found");
        }
        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }
        const document = await ctx.db.patch(args.id, {
            coverImage: undefined,
        });
        return document;
    },
});
