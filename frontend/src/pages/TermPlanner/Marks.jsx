import React, { useState } from 'react'

const Marks = () => {
  const [mark, setMark] = useState(91);
  
  return (
    <div>
      Mark: {mark}
    </div>
  )
}

export default Marks
