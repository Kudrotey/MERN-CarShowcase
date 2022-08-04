import Axios from "axios"
import React, { useState } from "react"

function CarsCard(props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftBrand, setDraftBrand] = useState("")
  const [file, setFile] = useState()
  const [draftModel, setDraftModel] = useState("")

  async function submitHandler(e) {
    e.preventDefault()
    setIsEditing(false)
    props.setCars(prev =>
      prev.map(function (car) {
        if (car._id == props.id) {
          return { ...car, brand: draftBrand, model: draftModel }
        }
        return car
      })
    )
    const data = new FormData()
    if (file) {
      data.append("photo", file)
    }
    data.append("_id", props.id)
    data.append("brand", draftBrand)
    data.append("model", draftModel)
    const newPhoto = await Axios.post("/update-car", data, { headers: { "Content-Type": "multipart/form-data" } })
    if (newPhoto.data) {
      props.setCars(prev => {
        return prev.map(function (car) {
          if (car._id == props.id) {
            return { ...car, photo: newPhoto.data }
          }
          return car
        })
      })
    }
  }

  return (
    <div className="card">
      <div className="our-card-top">
        {isEditing && (
          <div className="our-custom-input">
            <div className="our-custom-input-interior">
              <input onChange={e => setFile(e.target.files[0])} className="form-control form-control-sm" type="file" />
            </div>
          </div>
        )}
        <img src={props.photo ? `/uploaded-photos/${props.photo}` : "/fallback.png"} className="card-img-top" alt={`${props.model} named ${props.brand}`} />
      </div>
      <div className="card-body">
        {!isEditing && (
          <>
            <h4>{props.model}</h4>
            <p className="text-muted small">{props.brand}</p>
            {!props.readOnly && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setDraftBrand(props.brand)
                    setDraftModel(props.model)
                    setFile("")
                  }}
                  className="btn btn-sm btn-primary"
                >
                  Edit
                </button>{" "}
                <button
                  onClick={async () => {
                    const test = Axios.delete(`/car/${props.id}`)
                    props.setCars(prev => {
                      return prev.filter(car => {
                        return car._id != props.id
                      })
                    })
                  }}
                  className="btn btn-sm btn-outline-danger"
                >
                  Delete
                </button>
              </>
            )}
          </>
        )}
        {isEditing && (
          <form onSubmit={submitHandler}>
            <div className="mb-1">
              <input autoFocus onChange={e => setDraftBrand(e.target.value)} type="text" className="form-control form-control-sm" value={draftBrand} />
            </div>
            <div className="mb-2">
              <input onChange={e => setDraftModel(e.target.value)} type="text" className="form-control form-control-sm" value={draftModel} />
            </div>
            <button className="btn btn-sm btn-success">Save</button>{" "}
            <button onClick={() => setIsEditing(false)} className="btn btn-sm btn-outline-secondary">
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default CarsCard