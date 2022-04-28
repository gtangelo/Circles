import React, { useState , useSelector } from 'react'
import "./Marks.less"

const Marks = ({ mark, showMarks }) => {
  // const [mark, setMark] = useState(91);
  // const mark = 100;
  // const course = useSelector((state) => state.courses.course);
  
  return (showMarks) ? (
    <div className="marks-cont">
      <div className="marks-title">
        Mark:
      </div>
      <div className="marks-val">
        {(mark && showMarks) ? mark : "N/A"}
      </div>
    </div>
  ) : null;
}

export default Marks
