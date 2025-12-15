import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   MongoDB Connection 
================================ */

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
let usersCollection;
let listingsCollection;
let ordersCollection;

async function connectDB() {
  if (db) return;

  try {
    await client.connect();
    db = client.db(process.env.DB_NAME);

    usersCollection = db.collection("users");
    listingsCollection = db.collection("listings");
    ordersCollection = db.collection("orders");

    console.log(" MongoDB Connected");
  } catch (error) {
    console.error(" MongoDB Connection Failed:", error);
    throw error;
  }
}

/* ===============================
   DB Middleware 
================================ */

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).send({ message: "Database connection failed" });
  }
});

/* ===============================
   USERS API
================================ */

app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    const existingUser = await usersCollection.findOne({ email: user.email });

    if (existingUser) {
      return res.send({ message: "User already exists", insertedId: null });
    }

    const result = await usersCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to add user" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await usersCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch users" });
  }
});

app.get("/users/:email", async (req, res) => {
  try {
    const user = await usersCollection.findOne({ email: req.params.email });
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch user" });
  }
});

app.patch("/users/:email", async (req, res) => {
  try {
    const result = await usersCollection.updateOne(
      { email: req.params.email },
      { $set: req.body }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to delete user" });
  }
});

/* ===============================
   LISTINGS API
================================ */

app.post("/listings", async (req, res) => {
  try {
    const result = await listingsCollection.insertOne(req.body);
    res.send({ success: true, result });
  } catch (error) {
    res.status(500).send({ message: "Failed to add listing" });
  }
});

app.get("/listings", async (req, res) => {
  try {
    const result = await listingsCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch listings" });
  }
});

app.get("/listings/user/:email", async (req, res) => {
  try {
    const result = await listingsCollection
      .find({ email: req.params.email })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch listings" });
  }
});

app.get("/listings/:id", async (req, res) => {
  try {
    const result = await listingsCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch listing" });
  }
});

app.get("/listings/category/:category", async (req, res) => {
  try {
    const result = await listingsCollection
      .find({ category: req.params.category })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch category listings" });
  }
});

app.patch("/listings/:id", async (req, res) => {
  try {
    const result = await listingsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update listing" });
  }
});

app.delete("/listings/:id", async (req, res) => {
  try {
    const result = await listingsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to delete listing" });
  }
});

/* ===============================
   ORDERS API
================================ */

app.post("/orders", async (req, res) => {
  try {
    const result = await ordersCollection.insertOne(req.body);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to place order" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const result = await ordersCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch orders" });
  }
});

app.get("/orders/user/:email", async (req, res) => {
  try {
    const result = await ordersCollection
      .find({ email: req.params.email })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch user orders" });
  }
});

app.patch("/orders/:id", async (req, res) => {
  try {
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update order" });
  }
});

app.delete("/orders/:id", async (req, res) => {
  try {
    const result = await ordersCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to delete order" });
  }
});

/* ===============================
   ROOT
================================ */

app.get("/", (req, res) => {
  res.send("PawMart Server is Running...");
});

/* ===============================
   LOCAL ONLY
================================ */

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

export default app;
