/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Modal, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Item, theme } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useNavigate } from "react-router-dom";
import { DeleteFilled, InfoCircleFilled, EditFilled } from "@ant-design/icons";
import { FaRegCalendarTimes } from "react-icons/fa";
import { addTab } from "../../../reducers/courseTabsSlice";
import { removeCourse, unschedule } from "../../../reducers/plannerSlice";
import EditMarksModal from "../EditMarksModal";

import "./index.less";

const ContextMenu = ({ code, plannedFor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = () => {
    dispatch(removeCourse(code));
  };

  const handleUnschedule = () => {
    dispatch(unschedule({
      destIndex: null,
      code,
    }));
  };
  const id = `${code}-context`;

  const handleInfo = () => {
    navigate("/course-selector");
    dispatch(addTab(code));
  };

  // const validLetterGrades = ["SY", "PS", "CR", "DN", "HD"];
  // const [isEditMarkVisible, setIsEditMarkVisible] = useState(false);

  // const showEditMark = () => {
  //   setIsEditMarkVisible(true);
  // };

  // const [markInputBuf, setMarkInputBuf] = useState(
  //   useSelector((state) => state.planner.courses[code].mark),
  // );

  // const handleConfirmEditMark = (mark) => {
  //   const attemptedMark = ` ${mark}`.replaceAll(" ", "");

  //   if (
  //     (attemptedMark.isNaN && !validLetterGrades.includes(attemptedMark))
  //     || (parseFloat(attemptedMark) < 0 || parseFloat(attemptedMark) > 100)
  //   ) {
  //     return message.error("Could not update mark. Please enter a valid mark or letter grade");
  //   }
  //   dispatch(updateCourseMark({
  //     code,
  //     mark: attemptedMark,
  //   }));
  //   setIsEditMarkVisible(false);
  //   return message.success("Mark Updated");
  // };

  // const handleKeyDown = (e) => {
  //   if (e.key === "Enter") {
  //     handleConfirmEditMark(markInputBuf);
  //   }
  // };

  // const [markUpdatedQueued, setMarkUpdateQueued] = useState(false);
  // useEffect(() => {
  //   if (markUpdatedQueued) {
  //     setMarkUpdateQueued(false);
  //     handleConfirmEditMark(markInputBuf);
  //   }
  // });

  // const queueEditMark = () => {
  //   setMarkUpdateQueued(true);
  // };

  // const handleCancelEditMark = () => {
  //   setIsEditMarkVisible(false);
  //   setMarkUpdateQueued(false);
  // };

  const [isEditMarksVisible, setIsEditMarksVisible] = useState(false);

  return (
    <>
      <Menu id={id} theme={theme.dark}>
        {plannedFor && (
          <Item onClick={handleUnschedule}>
            <FaRegCalendarTimes className="context-menu-icon" /> Unschedule
          </Item>
        )}
        <Item onClick={handleDelete}>
          <DeleteFilled className="context-menu-icon" /> Delete from Planner
        </Item>
        <Item onClick={() => setIsEditMarksVisible(true)}>
          <EditFilled className="context-menu-icon" />
          Edit mark
        </Item>
        <Item onClick={handleInfo}>
          <InfoCircleFilled className="context-menu-icon" />
          View Info
        </Item>
      </Menu>
      <EditMarksModal
        isVisible={isEditMarksVisible}
        setIsVisible={setIsEditMarksVisible}
      />
    </>
  );
};

export default ContextMenu;
