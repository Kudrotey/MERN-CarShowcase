import Axios from "axios"
import React, { useState, useRef } from "react"

function CreateNewForm(props) {
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [file, setFile] = useState("")
  const CreatePhotoField = useRef()

  async function submitHandler(e) {
    e.preventDefault()
    const data = new FormData()
    data.append("photo", file)
    data.append("brand", brand)
    data.append("model", model)
    setBrand("")
    setModel("")
    setFile("")
    CreatePhotoField.current.value = ""
    const newPhoto = await Axios.post("/create-car", data, { headers: { "Content-Type": "multipart/form-data" } })
    props.setCars(prev => prev.concat([newPhoto.data]))
  }

  return (
    <form className="p-3 bg-success bg-opacity-25 mb-5" onSubmit={submitHandler}>
      <div className="mb-2">
        <input ref={CreatePhotoField} onChange={e => setFile(e.target.files[0])} type="file" className="form-control" />
      </div>
      <div className="mb-2">
        <input onChange={e => setBrand(e.target.value)} value={brand} type="text" className="form-control" placeholder="Car Brand" />
      </div>
      <div className="mb-2">
        <input onChange={e => setModel(e.target.value)} value={model} type="text" className="form-control" placeholder="Model" />
      </div>

      <button className="btn btn-success">New Car Entry</button>
    </form>
  )
}

export default CreateNewForm