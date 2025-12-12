
 const testControllers=(req,res)=>{
  res.status(200).send({
    message:"welcome user",
    success:true,
  })
}

module.exports={testControllers};
