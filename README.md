# E-Commerce App

## Live Site

The application is deployed and can be accessed at: [E-Commerce App](https://e-commerce-54.netlify.app)

## Todo

- add data to .env.local.example and make sure it is not being blocked via gitignore
- Deploy online (both app and db)
- Get user uploaded images and files to work on netlify
- Figure our how to backup data in NeonDB
- Allow uploading multiple product images per product (need to change how db handles product photos. currently only expects 1)
- Create an Admin Logout button (& auto logout after 1 hour of no browser activity)
- Create auth / custom handling for users (allow google auth or email:password setup). Currently, user/customer creation is initiated by a stripe webhook on successful payment. However this must be updated to a custom internal system that handles user/customer accounts & auth
- Create individual page for each product where a customer can see all details and specs (in depth) for a given product
- Fix caching issues for mini image in "ProductForm" (currently loads image from another product as the "current file)
- Fix caching issue: when a product image gets deleted, the cache still tries to load the same image but since it is already deleted, image fails to load instead of trying to clear cache and load again (figure out how to override cache if no image found)
- Fix caching issue: (make sure product price updates appear after an hour). Also, as soon as price is updated, if checking out, a user should be notified of price change

### Potential Features

- Begin using cloudinary for uploading image/video files (leave AWS S3 integrated for use of all other filetypes)
- switch ORM from Prisma to Drizzle
- Allow user to input richtext and store in DB with correct markdown
- Add a shopping cart (a part of adding this will mean adding the capability for an order to contain multiple products/items)
- Add a Shadcn DataTable for admin AdminProductsPage and hookup all data table features to product data
- If there is ever a use case for a complex form, use Shadcn "Form" component
- Handle Product Image Storage on Another Server, instead only store links to images in website DB
- Add more payment methods via stripe dashboard and gain control of payment menu option-tabs order (currently, I removed all options because I could not figure out how to get "Card"/"Link" to option #1/default option)
- Add a payment receipt and receipt#/order# on PurchaseSuccessPage (if purchase was successful)
- add image caching to assist with better load times (be very careful when implementing. this caused many issues in the past)

### DevMode Notes

- Command to run stripe payments locally: --forward-to localhost:3000/webhooks/stripe
- Command to test react-email templates: npm run email
- Command to run prisma studio: npx prisma studio
