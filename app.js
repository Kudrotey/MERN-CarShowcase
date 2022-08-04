const  express = require("express");
const {MongoClient, ObjectId} = require("mongodb");
const app = express();
const multer = require("multer");
const upload = multer();
const sanitizeHTML = require("sanitize-html");
const fsExtra = require("fs-extra");
const sharp = require("sharp");
const PORT = 3000;
let db;
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server")
const CarCard = require("./src/components/CarsCard").default;

// when the app first launches, make sure the public/uploaded-photos exits
fsExtra.ensureDirSync(path.join("public/uploaded-photos"))

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

// function passwordProtected(req, res, next) {
//     res.set("WWWW-Authenticate", "Basic realm='Our MERN App'");

//     if (req.headers.authorization == "234aff") {
//         next();
//     } else {
//         console.log(req.headers.authorization)
//         res.status(401).send("Try Again")
//     }
// }

app.get("/", async(req, res) => {
    const allCars = await db.collection("cars").find().toArray();
    const generatedHTML = ReactDOMServer.renderToString(
        <div className="container">
            {!allCars.length && <p>There are no cars listed yet</p>}
            <div className="car-grid mb-3">
                {allCars.map(car => <CarCard key={car._id} brand={car.brand} model={car.model} photo={car.photo} id={car._id} readOnly={true}/>)}
            </div>
            <p><a href="/admin">Manage Car Listings</a></p>
        </div>
    )
    res.render("home", {generatedHTML});
})

// app.use(passwordProtected);

app.get("/admin", (req, res) => {
    res.render("admin");
})

app.get("/api/cars", async(req, res) => {
    const allCars = await db.collection("cars").find().toArray();
    res.json(allCars);
})

app.post("/create-car", upload.single("photo"), ourCleanup, async (req, res) => {
    if(req.file) {
        const photofilename = `${Date.now()}.jpg`;
        await sharp(req.file.buffer).resize(844, 456).jpeg({quality: 60}).toFile(path.join("public", "uploaded-photos", photofilename));
        req.cleanData.photo = photofilename;
    }

    console.log(req.body);
    const info = await db.collection("cars").insertOne(req.cleanData);
    const newCar = await db.collection("cars").findOne({_id: new ObjectId(info.insertedId)});
    res.send(newCar);
})

app.delete("/car/:id", async (req, res) => {
    if(typeof req.params.id != "string") req.params.id = ""
    const doc = await db.collection("cars").findOne({_id: new ObjectId(req.params.id)})
    if(doc.photo) {
        fsExtra.remove(path.join("public", "uploaded-photos", doc.photo))
    }
    db.collection("cars").deleteOne({_id: new ObjectId(req.params.id)})
    res.send("Good Job")
})

app.post("/update-car",upload.single("photo"), ourCleanup, async (req, res) => {
    if(req.file) {
        const photofilename = `${Date.now()}.jpg`;
        await sharp(req.file.buffer).resize(844, 456).jpeg({quality: 60}).toFile(path.join("public", "uploaded-photos", photofilename));
        req.cleanData.photo = photofilename;
        const info = await db.collection("cars").findOneAndUpdate({_id: new ObjectId(req.body._id)}, {$set: req.cleanData})
        if(info.value.photo) {
            fsExtra.remove(path.join("public", "uploaded-photos", info.value.photo))
        }
        res.send(photofilename)
    } else {
        db.collection("cars").findOneAndUpdate({_id: new ObjectId(req.body._id)}, {$set: req.cleanData})
        res.send(false)
    }
})

function ourCleanup(req, res, next) {
    if(typeof req.body.brand != "string") req.body.brand = ""
    if(typeof req.body.model != "string") req.body.model = ""
    if(typeof req.body._id != "string") req.body._id = ""

    req.cleanData = {
        brand: sanitizeHTML(req.body.brand.trim(), {allowedTags: [], allowedAttributes: {}}),
        model: sanitizeHTML(req.body.model.trim(), {allowedTags: [], allowedAttributes: {}})
    }

    next();
}

async function start() {
    const client = new MongoClient("mongodb://root:root@localhost:27017/AmazingMernApp?&authSource=admin");
    await client.connect();
    db = client.db();

    app.listen(PORT, (req, res) => {
        console.log(`Listening on PORT ${PORT}...`);
    })
}

start();

