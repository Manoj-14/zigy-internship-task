const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const { count } = require("console");

const schema = mongoose.Schema;

const app = express();

const port = process.env.PORT || 5100;

app.set("port", port);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const dbUrl =
  "mongodb+srv://zigy:zigy123@cluster0.68e0q.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const userdetatisSchema = new schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

const UserDetails = mongoose.model("UserDetails", userdetatisSchema); // model is used to create collection in mongodb

// route to add user

const addUser = (req, res) => {
  const { name, email } = req.body;
  const user = new UserDetails({ name, email });
  UserDetails.count({ email: email }, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      console.log(result);
      if (result <= 0) {
        user.save((err, result) => {
          if (err) {
            res.status(500).json({ error: err });
          } else {
            res.redirect("/");
          }
        });
      } else {
        res.status(500).json({ error: "User already exists" });
      }
    }
  });
};

// route to delete user

const delUser = (req, res) => {
  const { email } = req.body;
  UserDetails.count({ email: email }, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      if (result > 0) {
        console.log(result);
        UserDetails.deleteOne({ email: email }, (err, result) => {
          if (err) {
            res.status(500).json({ error: err });
          } else {
            res.redirect("/");
            // res.status(200).json({ message: "User deleted successfully" });
          }
        });
      } else {
        res.status(500).json({ error: "User not exists" });
      }
    }
  });
};
app.get("/", (req, res) => {
  UserDetails.find({}, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      console.log(result.length);
      res.render("index.ejs", {
        result: result,
        length: result.length,
      });
    }
  });
});

app.post("/addUser", addUser);
app.post("/deluser", delUser);
