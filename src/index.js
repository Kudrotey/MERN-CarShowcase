import React, {useState, useEffect} from "react"
import {createRoot} from "react-dom/client"
import Axios from "axios"
import CreateNewForm from "./components/CreateNewForm";
import CarsCard from "./components/CarsCard";

function App() {
    const [cars, setCars] = useState([]);

    useEffect(() => {
        async function start() {
            const response = await Axios.get("/api/cars");
            setCars(response.data);
        }
        start()
    }, [])
    
    return (
        <div className="container">
            <p><a href="/">&laquo; Back to public homepage</a></p>
            <CreateNewForm setCars={setCars}/>
            <div className="car-grid">
                {cars.map(function(car) {
                    return <CarsCard key={car._id} brand={car.brand} model={car.model} photo={car.photo} id={car._id} setCars={setCars}/>
                })}
            </div>            
        </div>
    )
}

const root = createRoot(document.getElementById("app"));
root.render(<App />)