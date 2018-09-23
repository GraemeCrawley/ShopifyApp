const _ = require('lodash');

const Products = require('./data/products'); // This is to make available products.json file
const Shops = require('./data/shops');
const LineItems = require('./data/line_items');
const Orders = require('./data/orders');

/* Here a simple schema is constructed without using the GraphQL query language. 
  e.g. using 'new GraphQLObjectType' to create an object type 
*/

let {
  // Shop
  GraphQLFloat,


  // These are the basic GraphQL types need in this tutorial
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
  // This is used to create required fileds and arguments
  GraphQLNonNull,
  // This is the class we need to create the schema
  GraphQLSchema,
} = require('graphql');


const ProductType = new GraphQLObjectType({
  name: "Product",
  description: "This represents a product",
  fields: () => ({
    ID: {
      description: "ID of a prooduct",
      type: new GraphQLNonNull(GraphQLString)},
    Brand: {type: new GraphQLNonNull(GraphQLString)},
    Name: {type: new GraphQLNonNull(GraphQLString)},
    Price: {type: new GraphQLNonNull(GraphQLFloat)},
    PPG: {type: new GraphQLNonNull(GraphQLFloat)},
    Protein: {type: new GraphQLNonNull(GraphQLFloat)},
    Carbohydrates: {type: new GraphQLNonNull(GraphQLFloat)},
    Fat: {type: new GraphQLNonNull(GraphQLFloat)},
    Cholesterol: {type: new GraphQLNonNull(GraphQLFloat)},
    Sodium: {type: new GraphQLNonNull(GraphQLFloat)},
    Potassium: {type: new GraphQLNonNull(GraphQLFloat)},
    SaturatedFats: {type: new GraphQLNonNull(GraphQLFloat)},
    TransFats: {type: new GraphQLNonNull(GraphQLFloat)},
    PolysaturatedFats: {type: new GraphQLNonNull(GraphQLFloat)},
    Omega3: {type: new GraphQLNonNull(GraphQLFloat)},
    EPA: {type: new GraphQLNonNull(GraphQLFloat)},
    DHA: {type: new GraphQLNonNull(GraphQLFloat)},
    MonosaturatedFat: {type: new GraphQLNonNull(GraphQLFloat)},
    DietaryFiber: {type: new GraphQLNonNull(GraphQLFloat)},
    Sugars: {type: new GraphQLNonNull(GraphQLFloat)},
    OtherCarbohydrates: {type: new GraphQLNonNull(GraphQLFloat)},
    FoodTypeUpper: {type: new GraphQLNonNull(GraphQLString)},
    FoodTypeLower: {type: new GraphQLNonNull(GraphQLString)},
    Line_Items:  {
      description: "List of line items associated with this product",
      type: new GraphQLList(ProductType),
      resolve: function(product) {
        p_line_item_ids = _.map(product.Line_Items, l => l.Line_Item_ID);
        return _.filter(Line_Items, i => p_line_item_ids.includes(i.ID));
      }
    } 
  })
});


const ShopType = new GraphQLObjectType({
  name: "Shop",
  description: "This represents a shop",
  fields: () => ({
    ID: {type: new GraphQLNonNull(GraphQLString)},
    Name: {type: new GraphQLNonNull(GraphQLString)},
    Description: {type: GraphQLString},
    Products: {
      description: "List of products sold by a shop",
      type: new GraphQLList(ProductType),
      resolve: function(shop) {
        product_ids = _.map(shop.Products, b => b.Product_ID);
        return _.filter(Products, p => product_ids.includes(p.ID));
      }
    },
    Orders: {
      description: "List of orders fulfilled by a shop",
      type: new GraphQLList(OrderType),
      resolve: function(shop) {
        order_ids = _.map(shop.Orders, b => b.Order_ID);
        return _.filter(Orders, o => order_ids.includes(o.ID));
      }
    }
  })
});



const OrderType = new GraphQLObjectType({
  name: "Order",
  description: "This represents an order",
  fields: () => ({
    ID: {type: new GraphQLNonNull(GraphQLString)},
    Customer_ID: {type: new GraphQLNonNull(GraphQLString)},
    Line_Items: {
      type: new GraphQLList(LineItemType),
      resolve: function(order) {
        o_line_item_ids = _.map(order.Line_Items, l => l.Line_Item_ID);
        return _.filter(Line_Items, i => o_line_item_ids.includes(i.ID));
      }
    },
    Order_Total: {
      type: new GraphQLNonNull(GraphQLFloat),
      resolve: function(order) {
        o_line_item_ids = _.map(order.Line_Items, l => l.Line_Item_ID);
        // console.log(o_line_item_ids);
        line_item_details = _.filter(Line_Items, i => o_line_item_ids.includes(i.ID));
        // console.log(line_item_details);
        console.log(_.map(line_item_details, p => p.Line_Total));
        return _.map(line_item_details, p => p.Line_Total).reduce((a, b) => a + b, 0);
      }
    }
  })
});


const LineItemType = new GraphQLObjectType({
  name: "LineItem",
  description: "This represents a line item",
  fields: () => ({
    ID: {type: new GraphQLNonNull(GraphQLString)},
    Associated_Products: {
      type: new GraphQLList(LineItemType),
      resolve: function(p_line_item) {
        p_line_item_ids = _.map(p_line_item, l => l.ID);
        return _.filter(Products, p => p_line_item_ids.includes(p.ID));
      }
    },
    Quantity: {type: new GraphQLNonNull(GraphQLFloat)},
    Line_Total: {
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
  description: "Shop Application Schema Query Root",
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
