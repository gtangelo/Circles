import React, { Suspense } from 'react';
import { useContextMenu } from 'react-contexify';
import { useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Badge, Typography } from 'antd';
import { useTheme } from 'styled-components';
import { Term } from 'types/planner';
import { courseHasOffering } from 'utils/getAllCourseOfferings';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import useMediaQuery from 'hooks/useMediaQuery';
import ContextMenu from '../ContextMenu';
import { getNumTerms } from '../utils';
import S from './styles';

type Props = {
  code: string;
  index: number;
  term: string;
  showMultiCourseBadge: boolean;
};

const Draggable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Draggable }))
);

const DraggableCourse = ({ code, index, term, showMultiCourseBadge }: Props) => {
  const { courses, isSummerEnabled, completedTerms } = useSelector(
    (state: RootState) => state.planner
  );
  const planner = useSelector((state: RootState) => state.planner);
  const { showMarks } = useSelector((state: RootState) => state.settings);
  const theme = useTheme();
  const { Text } = Typography;

  // prereqs are populated in CourseDescription.jsx via course.raw_requirements
  const { title, isUnlocked, plannedFor, isLegacy, isAccurate, handbookNote, supressed, mark } =
    courses[code];
  const warningMessage = courses[code].warnings;

  const isOffered = plannedFor
    ? courseHasOffering(courses[code], plannedFor.slice(0, 4), term as Term)
    : true;
  const BEwarnings = handbookNote !== '' || !!warningMessage.length;

  const contextMenu = useContextMenu({
    id: `${code}-context`
  });

  const isDragDisabled = !!plannedFor && !!completedTerms[plannedFor];

  const isSmall = useMediaQuery('(max-width: 1400px)');
  const shouldHaveWarning =
    !supressed && (isLegacy || !isUnlocked || BEwarnings || !isAccurate || !isOffered);
  const errorIsInformational =
    shouldHaveWarning &&
    isUnlocked &&
    warningMessage.length === 0 &&
    !isLegacy &&
    isAccurate &&
    isOffered;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isDragDisabled) contextMenu.show({ event: e });
  };

  const stripExtraParenthesis = (warning: string): string => {
    if (warning[0] !== '(' || warning[warning.length - 1] !== ')') {
      return warning;
    }
    let openParenCount = 0;
    // If first open brace is ever fully closed, we don't want to strip them out
    for (let i = 0; i < warning.length - 1; i += 1) {
      if (warning[i] === '(') {
        openParenCount += 1;
      } else if (warning[i] === ')') {
        openParenCount -= 1;
      }
      if (openParenCount <= 0) {
        return warning;
      }
    }
    return stripExtraParenthesis(warning.slice(1, warning.length - 1));
  };

  const multiCourseBadgeStyle = {
    backgroundColor: theme.uocBadge.backgroundColor,
    boxShadow: 'none'
  };

  return (
    <>
      <Suspense fallback={<Spinner text="Loading Course..." />}>
        <Draggable isDragDisabled={isDragDisabled} draggableId={`${code}${term}`} index={index}>
          {(provided) => (
            <S.CourseWrapper
              summerEnabled={isSummerEnabled}
              isSmall={isSmall}
              dragDisabled={isDragDisabled}
              warningsDisabled={isDragDisabled && !isUnlocked}
              isWarning={!supressed && (!isUnlocked || !isOffered)}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              style={provided.draggableProps.style}
              data-tip
              data-for={code}
              id={code}
              onContextMenu={handleContextMenu}
            >
              {!isDragDisabled &&
                shouldHaveWarning &&
                (errorIsInformational ? (
                  <InfoCircleOutlined style={{ color: theme.infoOutlined.color }} />
                ) : (
                  <WarningOutlined
                    style={{ fontSize: '16px', color: theme.warningOutlined.color }}
                  />
                ))}
              <S.CourseLabel>
                {isSmall ? (
                  <Text className="text">{code}</Text>
                ) : (
                  <div>
                    <Text className="text">
                      <strong>{code}: </strong>
                      {title}
                    </Text>
                  </div>
                )}
                {showMarks && (
                  <div>
                    <Text strong className="text">
                      Mark:&nbsp;
                    </Text>
                    <Text className="text">
                      {/*
                          Marks can be strings (i.e. HD, CR) or a number (i.e. 90, 85).
                          Mark can be 0.
                        */}
                      {typeof mark === 'string' || typeof mark === 'number' ? mark : 'N/A'}
                    </Text>
                  </div>
                )}
                {showMultiCourseBadge && (
                  <S.MultiCourseBadgeWrapper>
                    <Badge
                      style={multiCourseBadgeStyle}
                      size="small"
                      count={`x${getNumTerms(planner.courses[code].UOC, true).toString()}`}
                    />
                  </S.MultiCourseBadgeWrapper>
                )}
              </S.CourseLabel>
            </S.CourseWrapper>
          )}
        </Draggable>
      </Suspense>
      <ContextMenu code={code} plannedFor={plannedFor} />
      {/* display prereq tooltip for all courses. However, if a term is marked as complete
        and the course has no warning, then disable the tooltip */}
      {isSmall && (
        <ReactTooltip id={code} place="top" effect="solid">
          {title}
        </ReactTooltip>
      )}
      {!isDragDisabled && shouldHaveWarning && (
        <ReactTooltip id={code} place="bottom">
          {isLegacy ? (
            'This course is discontinued. If an equivalent course is currently being offered, please pick that instead.'
          ) : !isOffered ? (
            'The course is not offered in this term.'
          ) : warningMessage.length !== 0 ? (
            stripExtraParenthesis(warningMessage.join('\n'))
          ) : (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: handbookNote }} />
          )}
          {!isAccurate ? ' The course info may be inaccurate.' : ''}
        </ReactTooltip>
      )}
    </>
  );
};

export default DraggableCourse;
