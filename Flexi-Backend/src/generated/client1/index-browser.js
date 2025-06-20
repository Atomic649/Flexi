
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  firstName: 'firstName',
  lastName: 'lastName',
  avatar: 'avatar',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  phone: 'phone',
  username: 'username',
  bio: 'bio',
  resetToken: 'resetToken',
  resetTokenExpiry: 'resetTokenExpiry'
};

exports.Prisma.MemberScalarFieldEnum = {
  uniqueId: 'uniqueId',
  role: 'role',
  permission: 'permission',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  businessId: 'businessId'
};

exports.Prisma.BusinessAccScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  businessName: 'businessName',
  businessUserName: 'businessUserName',
  businessAvatar: 'businessAvatar',
  businessAddress: 'businessAddress',
  vatId: 'vatId',
  businessType: 'businessType',
  taxType: 'taxType',
  userId: 'userId',
  memberId: 'memberId'
};

exports.Prisma.BillScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  cName: 'cName',
  cLastName: 'cLastName',
  cPhone: 'cPhone',
  cGender: 'cGender',
  cAddress: 'cAddress',
  cProvince: 'cProvince',
  cPostId: 'cPostId',
  product: 'product',
  payment: 'payment',
  amount: 'amount',
  purchaseAt: 'purchaseAt',
  platform: 'platform',
  cashStatus: 'cashStatus',
  price: 'price',
  image: 'image',
  deleted: 'deleted',
  memberId: 'memberId',
  businessAcc: 'businessAcc',
  storeId: 'storeId'
};

exports.Prisma.AdsCostScalarFieldEnum = {
  id: 'id',
  date: 'date',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  adsCost: 'adsCost',
  memberId: 'memberId',
  platformId: 'platformId',
  product: 'product',
  businessAcc: 'businessAcc'
};

exports.Prisma.ExpenseScalarFieldEnum = {
  date: 'date',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  id: 'id',
  amount: 'amount',
  group: 'group',
  image: 'image',
  note: 'note',
  desc: 'desc',
  deleted: 'deleted',
  save: 'save',
  channel: 'channel',
  code: 'code',
  businessAcc: 'businessAcc',
  memberId: 'memberId'
};

exports.Prisma.PlatformScalarFieldEnum = {
  id: 'id',
  platform: 'platform',
  accName: 'accName',
  accId: 'accId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  businessAcc: 'businessAcc',
  memberId: 'memberId',
  deleted: 'deleted'
};

exports.Prisma.StoreScalarFieldEnum = {
  id: 'id',
  platform: 'platform',
  accName: 'accName',
  accId: 'accId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  businessAcc: 'businessAcc',
  memberId: 'memberId',
  deleted: 'deleted'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  barcode: 'barcode',
  image: 'image',
  stock: 'stock',
  price: 'price',
  categoryId: 'categoryId',
  memberId: 'memberId',
  statusId: 'statusId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deleted: 'deleted',
  businessAcc: 'businessAcc'
};

exports.Prisma.CreditScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  ownerId: 'ownerId',
  creditorId: 'creditorId'
};

exports.Prisma.PostScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  hashtag: 'hashtag',
  content: 'content',
  mediaUrl: 'mediaUrl',
  mediaType: 'mediaType',
  published: 'published',
  authorId: 'authorId',
  deleted: 'deleted'
};

exports.Prisma.ReactionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  type: 'type',
  postId: 'postId',
  userId: 'userId'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  content: 'content',
  postId: 'postId',
  userId: 'userId',
  deleted: 'deleted'
};

exports.Prisma.InboxScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  message: 'message',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  read: 'read',
  unsent: 'unsent',
  deleted: 'deleted'
};

exports.Prisma.ShopScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  productType: 'productType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  category: 'category',
  sellerId: 'sellerId',
  buyerId: 'buyerId',
  deleted: 'deleted'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  quantity: 'quantity',
  shopId: 'shopId',
  buyerId: 'buyerId',
  sellerId: 'sellerId',
  deleted: 'deleted'
};

exports.Prisma.OptionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  name: 'name',
  shopId: 'shopId'
};

exports.Prisma.OptionValueScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  value: 'value',
  price: 'price',
  interest: 'interest',
  duration: 'duration',
  optionId: 'optionId'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  content: 'content',
  rating: 'rating',
  shopId: 'shopId',
  userId: 'userId',
  orderId: 'orderId'
};

exports.Prisma.CartScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  orderId: 'orderId',
  payment: 'payment',
  status: 'status',
  total: 'total'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
  owner: 'owner',
  marketing: 'marketing',
  accountant: 'accountant',
  sales: 'sales'
};

exports.BusinessType = exports.$Enums.BusinessType = {
  OnlineSale: 'OnlineSale',
  Massage: 'Massage',
  Restaurant: 'Restaurant',
  Bar: 'Bar',
  Cafe: 'Cafe',
  Hotel: 'Hotel',
  Tutor: 'Tutor',
  Influencer: 'Influencer',
  Other: 'Other'
};

exports.taxType = exports.$Enums.taxType = {
  Juristic: 'Juristic',
  Individual: 'Individual'
};

exports.Gender = exports.$Enums.Gender = {
  Female: 'Female',
  Male: 'Male'
};

exports.Payment = exports.$Enums.Payment = {
  COD: 'COD',
  Transfer: 'Transfer',
  CreditCard: 'CreditCard'
};

exports.IncomeChannel = exports.$Enums.IncomeChannel = {
  Storefornt: 'Storefornt',
  Facebook: 'Facebook',
  Line: 'Line',
  Tiktok: 'Tiktok',
  Shopee: 'Shopee',
  Lazada: 'Lazada',
  Instagram: 'Instagram',
  X: 'X',
  Youtube: 'Youtube',
  Google: 'Google',
  SCB: 'SCB',
  KBANK: 'KBANK',
  KTB: 'KTB',
  BBL: 'BBL',
  TMB: 'TMB'
};

exports.Bank = exports.$Enums.Bank = {
  SCB: 'SCB',
  KBANK: 'KBANK',
  KTB: 'KTB',
  BBL: 'BBL',
  TMB: 'TMB'
};

exports.SocialMedia = exports.$Enums.SocialMedia = {
  Facebook: 'Facebook',
  Line: 'Line',
  Tiktok: 'Tiktok',
  Shopee: 'Shopee',
  Lazada: 'Lazada',
  Instagram: 'Instagram',
  X: 'X',
  Youtube: 'Youtube',
  Google: 'Google'
};

exports.MediaType = exports.$Enums.MediaType = {
  VIDEO: 'VIDEO',
  IMAGE: 'IMAGE'
};

exports.ReactionType = exports.$Enums.ReactionType = {
  CREDIT: 'CREDIT',
  SPARK: 'SPARK',
  DISCREDIT: 'DISCREDIT'
};

exports.ProductType = exports.$Enums.ProductType = {
  Service: 'Service',
  Product: 'Product'
};

exports.Category = exports.$Enums.Category = {
  Loan: 'Loan',
  Coaching: 'Coaching',
  OEM: 'OEM',
  MarketingAgency: 'MarketingAgency',
  Packaging: 'Packaging',
  accountant: 'accountant',
  Inventory: 'Inventory'
};

exports.OptionName = exports.$Enums.OptionName = {
  Size: 'Size',
  Color: 'Color',
  Material: 'Material',
  Flavor: 'Flavor',
  CreditLimit: 'CreditLimit',
  QuantityLimit: 'QuantityLimit'
};

exports.Prisma.ModelName = {
  User: 'User',
  Member: 'Member',
  BusinessAcc: 'BusinessAcc',
  Bill: 'Bill',
  AdsCost: 'AdsCost',
  Expense: 'Expense',
  Platform: 'Platform',
  Store: 'Store',
  Product: 'Product',
  Credit: 'Credit',
  Post: 'Post',
  Reaction: 'Reaction',
  Comment: 'Comment',
  Inbox: 'Inbox',
  Shop: 'Shop',
  Order: 'Order',
  Option: 'Option',
  OptionValue: 'OptionValue',
  Review: 'Review',
  Cart: 'Cart'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
