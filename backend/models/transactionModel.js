import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    brand_name: {
      type: String,
      required: true,
    },
    batch_number: {
      type: String,
      required: true,
    },
    purchased_price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
    sale_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    profit: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const transaction = mongoose.model("transaction", transactionSchema);

export default transaction;
