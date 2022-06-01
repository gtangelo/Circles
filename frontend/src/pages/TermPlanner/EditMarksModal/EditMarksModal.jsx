import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Modal, Button, Input, message,
} from "antd";
import { updateCourseMark } from "../../../reducers/plannerSlice";

const EditMarksModal = ({
  code, visible, setVisible,
}) => {
  const [mark, setMark] = useState(useSelector((state) => state.planner.courses[code].mark));
  const dispatch = useDispatch();
  const letterGrades = ["FL", "PS", "CR", "DN", "HD"];

  const handleConfirmEditMark = () => {
    if (
      (mark.isNaN && !letterGrades.includes(mark))
      || (parseFloat(mark) < 0 || parseFloat(mark) > 100)
    ) {
      return message.error("Could not update mark. Please enter a valid mark or letter grade");
    }
    dispatch(updateCourseMark({
      code,
      mark,
    }));
    setVisible(false);
    return message.success("Mark Updated");
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleConfirmEditMark();
    }
  };

  const handleConfirmLetterGradeMark = (grade) => {
    dispatch(updateCourseMark({
      code,
      mark: grade,
    }));
    setMark(grade);
    setVisible(false);
    return message.success("Mark Updated");
  };

  return (
    <Modal
      title={`Edit Mark: ${code}`}
      visible={visible}
      onOk={handleConfirmEditMark}
      onCancel={() => setVisible(false)}
      width="300px"
    >
      <div className="edit-mark">
        <div className="edit-mark-head" />
        <Input
          onChange={(e) => setMark(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="Enter Mark"
          value={mark}
        />
        <div className="letter-grade-container">
          {
            letterGrades.map((letterGrade) => (
              <Button onClick={() => handleConfirmLetterGradeMark(letterGrade)} className="letter-grade-button">
                {letterGrade}
              </Button>
            ))
          }
        </div>
      </div>
    </Modal>
  );
};

export default EditMarksModal;
