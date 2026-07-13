import RestaurantForm from "../../components/admin/RestaurantForm"
export default function AddRestaurant() {
  return (
    <div className="container py-5 text-light">
      <h1>Add Restaurant</h1>
       <div className="container py-5">
      <RestaurantForm />
    </div>
    </div>
  )
}