import React, { useState, useSelector } from "react";
import "./main.less";
import "./Marks.less";
import { Typography } from "antd";
import KebabMenuIcon from "./KebabMenuIcon";

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
      <Text className="text marks-val">
        {(mark && showMarks) ? mark : "N/A"}
      </Text>
      {/* TODO: Move to draggable course? */}
      <KebabMenuIcon />
    </div>
  ) : null;
};

export default Marks;
