import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  merchantName: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    enum: ['Sale', 'New', null],
    default: null
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    trim: true,
    default: ''
  },
  specifications: {
    length: {
      type: String,
      trim: true,
      default: ''
    },
    width: {
      type: String,
      trim: true,
      default: ''
    },
    height: {
      type: String,
      trim: true,
      default: ''
    },
    weight: {
      type: String,
      trim: true,
      default: ''
    },
    material: {
      type: String,
      trim: true,
      default: ''
    }
  },
  variants: [{
    size: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  sizeGuideUrl: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
