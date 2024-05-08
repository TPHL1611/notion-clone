-   Package/Library

    -   usehooks-ts: xử lý mediaquery xịn hơn tailwind
    -   sonner: Toast notification

-   Write Custom Hooks

    -   Always return something (/hooks/use-scroll-top.tsx) (error 1)

-   Warning on console log

    -   disabled hydration: add attribute "suppressHydrationWarning" to html tag (/app/layout.tsx) (warning 1)

-   Convex database
    -   mutation(): reading and writing data from/to database (usually use writing case)
    -   query(): reading data from database
    -   Method:
        -   ctx: represent for convex
            -   .auth.getUserIdentity(): get user object information
            -   .auth.getUserIdentity().subject: get userId information
            -   .db.insert(): insert data to database
            -   .db.get(): get data from database
            -   .db.query(): query data from database
        -   args: represent for request from client (params type: object)
