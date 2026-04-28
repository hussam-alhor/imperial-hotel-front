import "./notFound.css"
import { useNavigate } from 'react-router-dom'

const NotFounPage = () => {
    const navigate = useNavigate()
  return (
   <section className="notFound">
    <div className="notFoundTitle">
        404
    </div>
    <h1 className="notFoundText">
        Page Not Found
    </h1>
    <button className='notFounfLink' onClick={()=> navigate("/", {replace : true})}>Go to home page</button>
   </section>
  )
}

export default NotFounPage