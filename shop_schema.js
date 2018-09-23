const _ = require('lodash');

const Products = require('./data/products'); // This is to make available products.json file
const Shops = require('./data/shops');
const LineItems = require('./data/line_items');
const Orders = require('./data/orders');


// Get all necessary GraphQL types
let {
  GraphQLFloat,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLSchema,
} = require('graphql');


// Create the product type
const ProductType = new GraphQLObjectType({
  name: "Product",
  description: "This represents a product.",
  fields: () => ({
    ID: {
      description: "ID of a product.",
      type: new GraphQLNonNull(GraphQLString)},
    Brand: {
      description: "Brand of a product.",
      type: new GraphQLNonNull(GraphQLString)},
    Name: {
      description: "Name of a product.",
      type: new GraphQLNonNull(GraphQLString)},
    Price: {
      description: "Price of a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    PPG: {
      description: "Price per 100 g of a prooduct. Used to calculate nutritional value.",
      type: new GraphQLNonNull(GraphQLFloat)},
    Protein: {
      description: "Amount of protein (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    Carbohydrates: {
      description: "Amount of carbohydrates (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    Fat: {
      description: "Amount of fat (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    Cholesterol: {
      description: "Amount of cholesterol (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    Sodium: {
      description: "Amount of sodium (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    Potassium: {
      description: "Amount of potassium (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    SaturatedFats: {
      description: "Amount of saturated fats (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    TransFats: {
      description: "Amount of transfats (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    PolysaturatedFats: {
      description: "Amount of polysaturated fats (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    Omega3: {
      description: "Amount of omega-3s (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    EPA: {
      description: "Amount of EPA (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    DHA: {
      description: "Amount of DHA (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    MonosaturatedFat: {
      description: "Amount of monosaturated fats (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    DietaryFiber: {
      description: "Amount of dietary fiber (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    Sugars: {
      description: "Amount of sugars (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    OtherCarbohydrates: {
      description: "Amount of other carbohydrates (g) per 100 g in a product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    FoodTypeUpper: {
      description: "High level food type of a product.",
      type: new GraphQLNonNull(GraphQLString)},
    FoodTypeLower: {
      description: "Low level food type of a product.",
      type: new GraphQLNonNull(GraphQLString)},
    Line_Items:  {
      description: "List of line items associated with this product",
      type: new GraphQLList(LineItemType),
      resolve: function(product) {
        p_line_item_ids = _.map(product.Line_Items, l => l.Line_Item_ID);
        return _.filter(Line_Items, i => p_line_item_ids.includes(i.ID));
      }
    } 
  })
});


// Create the shop type
const ShopType = new GraphQLObjectType({
  name: "Shop",
  description: "This represents a shop.",
  fields: () => ({
    ID: {
      description: "ID of a shop.",
      type: new GraphQLNonNull(GraphQLString)},
    Name: {
      description: "Name of a shop.",
      type: new GraphQLNonNull(GraphQLString)},
    Description: {
      description: "Description of a shop.",
      type: GraphQLString},
    Products: {
      description: "List of products sold by a shop.",
      type: new GraphQLList(ProductType),
      resolve: function(shop) {
        product_ids = _.map(shop.Products, b => b.Product_ID);
        return _.filter(Products, p => product_ids.includes(p.ID));
      }
    },
    Orders: {
      description: "List of orders fulfilled by a shop.",
      type: new GraphQLList(OrderType),
      resolve: function(shop) {
        order_ids = _.map(shop.Orders, b => b.Order_ID);
        return _.filter(Orders, o => order_ids.includes(o.ID));
      }
    }
  })
});


// Create the order type
const OrderType = new GraphQLObjectType({
  name: "Order",
  description: "This represents an order.",
  fields: () => ({
    ID: {
      description: "ID of an order.",
      type: new GraphQLNonNull(GraphQLString)},
    Customer_ID: {
      description: "ID of the customer who made the order.",
      type: new GraphQLNonNull(GraphQLString)},
    Line_Items: {
      description: "List of line items for an order.",
      type: new GraphQLList(LineItemType),
      resolve: function(order) {
        o_line_item_ids = _.map(order.Line_Items, l => l.Line_Item_ID);
        return _.filter(Line_Items, i => o_line_item_ids.includes(i.ID));
      }
    },
    Order_Total: {
      description: "Total cost of an order.",
      type: new GraphQLNonNull(GraphQLFloat),
      resolve: function(order) {
      totals = _.map(
        order.Line_Items, l => 
        _.find(Line_Items, i => 
        l.Line_Item_ID == i.ID
        )
        .Quantity * 
        _.find(Products, a => 
        _.find(a.Line_Items, b => 
        b.Line_Item_ID == l.Line_Item_ID)).Price
        );
      return totals.reduce((a, b) => a + b, 0);
      }
    }
  })
});


// Create the line item type
const LineItemType = new GraphQLObjectType({
  name: "LineItem",
  description: "This represents a line item",
  fields: () => ({
    ID: {
      description: "ID of a line item.",
      type: new GraphQLNonNull(GraphQLString)},
    Associated_Product: {
      description: "Product associated with a line item.",
      type: ProductType,
      resolve: function(p_line_item) {
        line_id = p_line_item.ID;
        return _.find(Products, a => _.find(a.Line_Items, b => b.Line_Item_ID == line_id));
      }
    },
    Quantity: {
      description: "Quantity sold of a given product.",
      type: new GraphQLNonNull(GraphQLFloat)},
    Line_Total: {
      description: "Total cost of the line item. This will be the price of a product multiplied by the quantity of the product sold.",
      type: new GraphQLNonNull(GraphQLFloat),
      resolve: function(t_line_item) {
        line_id = t_line_item.ID;
        product_for_line_item = _.find(Products, a => _.find(a.Line_Items, b => b.Line_Item_ID == line_id));
        return  product_for_line_item.Price * t_line_item.Quantity;
      }
    }
  })
});



// This is the Root Query
const ShopQueryRootType = new GraphQLObjectType({
  name: 'ShopAppSchema',
  description: "Shop Application Schema Query Root. Click me for the rest of the documentation.",
  fields: () => ({
    products: {
      type: new GraphQLList(ProductType),
      description: "List of all Products",
      resolve: function() {
        return Products
      }
    },
    shops: {
      type: new GraphQLList(ShopType),
      description: "List of all Shops",
      resolve: function() {
        return Shops
      }
    },
    orders: {
      type: new GraphQLList(OrderType),
      description: "List of all Orders",
      resolve: function() {
        return Orders
      }
    },
    line_items: {
      type: new GraphQLList(LineItemType),
      description: "List of all Line Items",
      resolve: function() {
        return Line_Items
      }
    }
  })
});


// This is the schema declaration
const ShopAppSchema = new GraphQLSchema({
  query: ShopQueryRootType
  // If you need to create or updata a datasource, 
  // you use mutations. Note:
  // mutations will not be explored in this post.
  // mutation: BlogMutationRootType 
});

module.exports = ShopAppSchema;
