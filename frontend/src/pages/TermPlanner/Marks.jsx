import React, { useState , useSelector } from 'react'
import "./main.less";
import "./Marks.less"
import kebabMenuIcon from './kebabMenuIcon';
import { Typography } from "antd";


const Marks = ({ mark, showMarks }) => {
  // const [mark, setMark] = useState(91);
  // const mark = 100;
  // const course = useSelector((state) => state.courses.course);

  const { Text } = Typography;
  
  return (showMarks) ? (
    <div className="marks-cont">
      <Text strong className="text">
        Mark:
      </Text>
      <Text className="text">
        {(mark && showMarks) ? mark : "N/A"}
      </Text>
      <kebabMenuIcon />
    </div>
  ) : null;
}

export default Marks
