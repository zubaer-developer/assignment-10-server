import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

async function connectDB() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("Database Connected Successfully");

    usersCollection = db.collection("users");
    console.log("Users Collection Ready");

    listingsCollection = db.collection("listings");
    console.log("Listings Collection Ready");
  } catch (error) {
    console.log("Database Connection Failed:", error);
  }
}

connectDB();

// Add New User
app.post("/users", async (req, res) => {
  const user = req.body;

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email: user.email });

  if (existingUser) {
    return res.send({ message: "User already exists", insertedId: null });
  }

  // Insert new user
  const result = await usersCollection.insertOne(user);
  res.send(result);
});

// Get All Users
app.get("/users", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

//Get a Single User by Email
app.get("/users/:email", async (req, res) => {
  const email = req.params.email;

  const user = await usersCollection.findOne({ email });

  res.send(user);
});

// Update User (PATCH /users/:email)
app.patch("/users/:email", async (req, res) => {
  const email = req.params.email;
  const updatedUser = req.body;

  const filter = { email: email };
  const updateDoc = {
    $set: updatedUser,
  };

  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});

// Single User DELETE
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error deleting user" });
  }
});

// Add a new listing
app.post("/listings", async (req, res) => {
  const listing = req.body;

  try {
    const result = await listingsCollection.insertOne(listing);
    res.send({ message: "Listing added successfully", result });
  } catch (error) {
    res.status(500).send({ message: "Error adding listing", error });
  }
});

// Get all listings
app.get("/listings", async (req, res) => {
  try {
    const result = await listingsCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error fetching listings", error });
  }
});

app.get("/", (req, res) => {
  res.send("PawMart Server is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
