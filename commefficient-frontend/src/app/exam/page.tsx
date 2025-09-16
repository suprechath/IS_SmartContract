const page = () => {
  return (
    <div className="p-8 bg-background">
      <h1 className="text-3xl font-bold font-heading text-foreground">
        Welcome to CommEfficient
      </h1>
      
      <div className="p-6 mt-4 border rounded-lg bg-card shadow-medium">
        <p className="text-card-foreground">
          This is a card component using your custom theme.
        </p>
      </div>

      <div className="flex gap-4 mt-6">
        <button className="px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark shadow-primary">
          Primary Action
        </button>
        <button className="px-4 py-2 rounded-md text-secondary-foreground bg-secondary hover:bg-secondary-dark">
          Secondary Action
        </button>
      </div>

       <div className="p-4 mt-4 rounded-md bg-destructive">
          <p className="font-semibold text-destructive-foreground">
            This is a destructive action message.
          </p>
       </div>
    </div>
  )
}
export default page