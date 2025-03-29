import Image from "next/image"

const RegisterForm = () => {
  return (
    <div>
      <div className="flex justify-center mb-6">
        <Image
          src="/images/nestledigitalpharmasummitvertical.svg"
          alt="Nestle Digital Pharma Summit"
          width={250}
          height={200}
          priority
        />
      </div>
      {/* Rest of the form will go here */}
    </div>
  )
}

export default RegisterForm

