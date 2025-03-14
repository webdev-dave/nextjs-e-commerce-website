# E-Commerce App

## Todo

- Allow uploading multiple product images per product (need to change how db handles product photos. currently only expects 1)
- Create an Admin Logout button (& auto logout after 1 hour of no browser activity)
- Create auth / custom handling for users (allow google auth or email:password setup). Currently, user/customer creation is initiated by a stripe webhook on successful payment. However this must be updated to a custom internal system that handles user/customer accounts & auth
- Create individual page for each product where a customer can see all details and specs (in depth) for a given product

### Potential Features

- Allow user to input richtext and store in DB with correct markdown
- Add a shopping cart (a part of adding this will mean adding the capability for an order to contain multiple products/items)
- Add a Shadcn Data Table for admin AdminProductsPage and hookup all data table features to product data
- If there is ever a use case for a complex form, use Shadcn "Form" component
- Handle Product Image Storage on Another Server, instead only store links to images in website DB
- Add more payment methods via stripe dashboard and gain control of payment menu option-tabs order (currently, I removed all options because I could not figure out how to get "Card"/"Link" to option #1/default option)
- Add a payment receipt and receipt#/order# on PurchaseSuccessPage (if purchase was successful)

### DevMode Notes

- Command to run stripe payments locally: --forward-to localhost:3000/webhooks/stripe
- Command to test react-email templates: npm run email
