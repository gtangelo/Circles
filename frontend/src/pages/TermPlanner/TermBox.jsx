import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { useSelector, useDispatch } from "react-redux";
import { Badge } from "antd";
import { RiCheckboxCircleFill } from "react-icons/ri";
import DraggableCourse from "./DraggableCourse";
import { toggleTermComplete } from "../../reducers/plannerSlice";

const TermBox = ({
  name, courses, termsOffered, isDragging, showMarks
}) => {
  const term = name.match(/T[0-3]/)[0];

  const { isSummerEnabled, completedTerms } = useSelector((state) => state.planner);

  const dispatch = useDispatch();
  const handleCompleteTerm = () => {
    dispatch(toggleTermComplete(name));
  };

  const isCompleted = !!completedTerms[name];

  const isOffered = termsOffered.includes(term) && !isCompleted;

  return (
    <Droppable droppableId={name} isDropDisabled={isCompleted}>
      {(provided) => (
        <Badge
          count={(
            <RiCheckboxCircleFill
              size="1.5em"
              className={`termCheckbox ${isCompleted && "checkedTerm"}`}
              onClick={handleCompleteTerm}
            />
          )}
          offset={isSummerEnabled ? [-13, 13] : [-22, 22]}
        >
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`termBox ${
              isOffered && isDragging && "droppable "
            } ${isSummerEnabled && "summerTermBox"} `}
          >
            {courses.map((code, index) => <DraggableCourse
              key={code}
              code={code}
              index={index}
              showMarks={showMarks}
            />)}
            {provided.placeholder}
          </ul>
        </Badge>
      )}
    </Droppable>
  );
};

export default TermBox;
