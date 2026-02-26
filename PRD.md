📘 PRODUCT REQUIREMENTS DOCUMENT (PRD)
Jewellery Ecommerce Backend System

Version: 1.0
Last Updated: 2026-02-24
Backend Stack: Node.js (Express) + MySQL + Knex
Auth: Handled separately (NOT part of this PRD)

1. PROJECT OVERVIEW

This backend powers a jewellery ecommerce platform selling:

Gold jewellery

Silver jewellery

Diamond jewellery

Gold + Diamond combinations

Silver + Diamond combinations

Mixed metal jewellery (Gold + Silver etc.)

Items like Rings, Earrings, Kadas, Pendants, Chains, Bracelets, Coins, Bars

The system dynamically calculates final product price using:

Metal components (gold/silver/platinum)

Metal purity (22K, 18K, 24K, 925 etc.)

Stones (Diamond, CZ, Ruby, etc.)

Live metal rates

Live stone rates

Making charges

Wastage %

Margin %

GST rules (CGST/SGST/IGST)

The backend also includes:

Categories

Collections

Admin product management

Cart system

Order management

Payment tracking

(🔒 NO user authentication tables included — handled by developer separately)

2. HIGH-LEVEL FEATURES
2.1 Admin Capabilities

Create / Update / Delete categories

Create / Update / Delete collections

Create / Update / Delete products

Upload product images (max 5)

Add metal components per product

Add stone components per product

Update metal/gold/silver rates

Update stone/diamond rates

View all orders

Change order status

2.2 Customer Capabilities

View products

View product price (calculated live)

Add products to cart

Update cart quantity

Remove cart items

Checkout and place order

Make payment

View order status

2.3 Price Calculation Engine
Metal Cost

sum(weight × rate_per_gram)

Stone Cost

sum(carat × rate_per_carat)

Making Charges

per_gram: (total_metal_weight × making_charge_value)

fixed: (making_charge_value)

Wastage

total_metal_cost × (wastage_percent / 100)

Subtotal

metal_cost + stone_cost + making_charge + wastage

Margin

subtotal × (margin_percent / 100)

GST

Same state: CGST 1.5% + SGST 1.5%

Different state: IGST 3%

Final Price

subtotal + margin + GST

3. DATABASE TABLES

This project uses 14 core tables (auth tables intentionally excluded).

A. PRODUCT + CATALOG TABLES (8 Tables)
1. categories

Defines jewellery type.

Field	Description
id	PK
name	Rings, Earrings, Pendants…
slug	URL-friendly name

Example rows

id	name	slug
1	Rings	rings
2	Earrings	earrings
2. collections

Marketing themes.

Field	Description
id	PK
name	Office/Morden/Casual/Wedding
slug	URL-friendly

Example rows

id	name	slug
1	Office Wear	office-wear
2	Modern Wear	modern-wear
3. products (MAIN TABLE)

Stores product metadata (NOT price components).

Field	Description
id	PK
name	Product title
sku	Unique code
product_type	ring/pendant/kada…
target_gender	men/women/unisex
category_id	FK → categories.id
collection_id	FK → collections.id
default_metal_type	gold/silver/platinum
making_charge_type	per_gram/fixed
making_charge_value	numeric
wastage_percent	numeric
margin_percent	numeric
gst_percent	usually 3%
status	active/inactive

Example row

id	name	sku	product_type	category_id	collection_id	making_charge_type	making_charge_value	wastage_percent	margin_percent
3	22K Gold & Silver Diamond Pendant	PD001	pendant	4	2	per_gram	450.00	3.00	12.00
4. product_images

Up to 5 images per product.

Field	Description
id	PK
product_id	FK
image_url	image path

Example rows

id	product_id	image_url
1	3	/uploads/pd001-front.jpg
2	3	/uploads/pd001-side.jpg
5. product_metal_components

Stores metal details.

Field	Description
id	PK
product_id	FK
metal_type	gold/silver
purity_code	22K, 18K, 925 etc.
purity_value	%
weight_grams	numeric
is_primary	boolean

Example rows

id	product_id	metal_type	purity_code	weight
3	3	gold	22K	3.000
4	3	silver	925	2.000
6. product_stone_components

Stores diamond/gemstone details.

Field	Description
id	PK
product_id	FK
stone_type	diamond/cz/etc
clarity_grade	VS1/VVS/etc
color_grade	G/H/etc
cut_grade	Excellent/Good
weight_carat	numeric
piece_count	numeric

Example row

id	product_id	stone_type	clarity	color	weight_carat
1	3	diamond	VS1	G	0.250
7. metal_rates

Rate per gram for metals.

Field	Description
metal_type	gold/silver
purity_code	22K, 925
rate_per_gram	numeric
effective_from	date

Example rows

metal_type	purity	rate
gold	22K	5700
silver	925	75
8. stone_rates

Rate per carat for stones.

Field	Description
stone_type	diamond/cz
clarity_grade	VS1
color_grade	G
rate_per_carat	numeric

Example rows

stone_type	clarity	color	rate
diamond	VS1	G	60000
cz	AAA	null	2000
B. ADMIN + CART + ORDER SYSTEM (6 Tables)
9. admins

Admin users for managing system.

Field	Description
id	PK
name	admin
email	unique
password_hash	hashed password
role	superadmin/manager

Example row

id	name	email
1	Admin	admin@store.com
10. carts

Active carts per user.

Field	Description
id	PK
user_id	mapped to your auth system
status	active/converted

Example

id	user_id	status
1	101	active
11. cart_items

Products inside a cart.

Field	Description
cart_id	FK
product_id	FK
quantity	number

Example rows

id	cart_id	product_id	qty
1	1	3	1
2	1	1	2
12. orders

Main order record.

Field	Description
id	PK
user_id	customer id
order_number	unique
status	pending/confirmed/delivered
subtotal_amount	before GST
total_gst_amount	tax
total_amount	final
shipping_name	stored snapshot
shipping_state	needed for GST

Example row

id	order_number	subtotal	gst	total
1	ORD2026022401	39219.60	1176.59	40396.19
13. order_items

Stores product-level snapshot at checkout.

Fields

order_id

product_id

quantity

unit_price

metal_cost

stone_cost

making_charge

wastage_amount

margin_amount

gst_amount

Example row

order_id	product_id	unit_price	metal	stone	making	gst
1	3	40396.19	17250	15000	2250	1176.59
14. payments

Payment gateway response table.

Fields

order_id

payment_gateway

payment_method

amount

status

transaction_id

Example

order_id	gateway	amount	status
1	razorpay	40396.19	success
4. SYSTEM FLOWS
A. PRODUCT CREATION FLOW

Admin creates category

Admin creates collection

Admin creates product

Admin uploads product images (max 5)

Admin adds metal components

Admin adds stone components

Admin updates metal/stone rates

Price is calculated dynamically when viewed

B. CART FLOW

User adds product to cart

Cart → stores product_id + quantity

Price is recalculated each time using live rates

User updates/removes cart items

C. ORDER FLOW

User checks out

Backend calculates final price

Creates order + order_items snapshot

Creates payment entry

When payment gateway success → update payment + order status

5. NON-FUNCTIONAL REQUIREMENTS

Fast responses (< 300ms)

Accurate dynamic pricing

Clean SQL schema

Proper validations (max 5 images per product)

Error logging

Rate tables must always reflect latest metal & stone rates

6. OUT OF SCOPE (Handled separately)

❌ User authentication / tokens
❌ Shipping provider integration
❌ Frontend UI
❌ Coupons & discounts
❌ Inventory management (can be added later)

7. FINAL LIST OF TABLES (14 TOTAL)
PRODUCT SYSTEM

categories

collections

products

product_images

product_metal_components

product_stone_components

metal_rates

stone_rates

ADMIN / CART / ORDER

admins

carts

cart_items

orders

order_items

payments