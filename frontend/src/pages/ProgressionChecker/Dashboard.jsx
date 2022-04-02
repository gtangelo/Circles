import React from "react";
import axios from "axios";
import { Typography } from "antd";
import { useSpring, animated } from "react-spring";
import { useSelector, useDispatch } from "react-redux";
import DegreeCard from "./DegreeCard";
import SkeletonDashboard from "./SkeletonDashboard";
import LiquidProgressChart from "../../components/liquidProgressChart/LiquidProgressChart";

const Dashboard = ({ isLoading, degree }) => {
  const { Title } = Typography;
  const currYear = new Date().getFullYear();

  const props = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    config: { tension: 80, friction: 60 },
  });

  const [coursesUnits, setCoursesUnits] = React.useState({});
  const [structure, setStructure] = React.useState({});
  const [menuData, setMenuData] = React.useState({});
  const [degreeUOC, setDegreeUOC] = React.useState({});
  // const [programName, setProgramName] = React.useState({});
  // const [programCode, setProgramCode] = React.useState({});

  const fetchStructure = async () => {
    try {
      const res1 = await axios.get(
        `http://localhost:8000/programs/getStructure/${programCode}/${specialisation}/${
          minor !== "" ? minor : ""
        }`
      );
      setStructure(res1.data.structure);
    } catch (err) {
      console.log(err);
    }
  };

  const { programCode, programName, specialisation, minor } = useSelector(
    (state) => state.degree
  );

  // const fetchDegree = async () => {
  //   try{
  //     const res = await axios.get(
  //       `http://localhost:8000/programs/getPrograms`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     setDegree2(res.data.programs[programCode]);
  //     console.log(degree2);
  //   } catch(err){
  //     console.log(err);
  //   }
  // };

  React.useEffect(() => {
    fetchStructure();
  }, []);



  const planner = useSelector((state) => state.planner);
  const coursesInPlanner = planner.courses;
  let selectedCourses = {};
  for (const course of coursesInPlanner.keys()) {
    selectedCourses[course] = 70;
  }

  const { startYear } = useSelector((state) => state.planner);
  const specialisations = {};
  specialisations[specialisation] = 1;
  if (minor !== "") specialisations[minor] = 1;
  const payload = {
    program: programCode,
    specialisations: specialisations,
    courses: selectedCourses,
    year: new Date().getFullYear() - startYear,
  };

  React.useEffect(async () => {
    try {
      console.log(JSON.stringify(payload));
      const res = await axios.post(
        `http://localhost:8000/courses/getAllUnlocked/`,
        JSON.stringify(payload),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      generateMenuData(res.data.courses_state);
    } catch (err) {
      console.log(err);
    }
  }, [structure, coursesInPlanner]);

  const generateMenuData = (courses) => {
    let newMenu = {};
    let newCoursesUnits = {};
    let totalUOC = 0;
    let currUOC = 0;

    // Example groups: Major, Minor, General
    for (const group in structure) {
      newMenu[group] = {};
      // Example subGroup: Core Courses, Computing Electives


      newCoursesUnits[group] = {};

      for (const subGroup in structure[group]) {
        if (typeof structure[group][subGroup] !== "string") {
          newCoursesUnits[group][subGroup] = {};
          newCoursesUnits[group][subGroup].total =
            structure[group][subGroup].UOC;
          totalUOC = totalUOC + structure[group][subGroup].UOC;
          newCoursesUnits[group][subGroup].curr = 0;

          newMenu[group][subGroup] = [];
          // only consider disciplinary component courses
          if (structure[group][subGroup].courses) {
            const subCourses = Object.keys(structure[group][subGroup].courses); // e.g. [ "COMP3", "COMP4" ]
            const regex = subCourses.join("|"); // e.g. "COMP3|COMP4"
            for (const courseCode in courses) {
              if (
                courseCode.match(regex) &&
                // courses[courseCode].is_accurate &&
                courses[courseCode].unlocked
              ) {
                
                newMenu[group][subGroup].push({courseCode: courseCode, accuracy: courses[courseCode].is_accurate});
                // add UOC to curr
                if (coursesInPlanner.get(courseCode))
                  newCoursesUnits[group][subGroup].curr +=
                    coursesInPlanner.get(courseCode).UOC;
              }
            }
          } else {
            for (const courseCode of coursesInPlanner.keys()) {
              const courseData = coursesInPlanner.get(courseCode)
              if (courseData && courseData.type === subGroup) {
                newMenu[group][subGroup].push(courseCode);
                // add UOC to curr
                newCoursesUnits[group][subGroup].curr += courseData.UOC;
                currUOC += courseData.UOC;
              }
            }
            
          }
          currUOC += newCoursesUnits[group][subGroup].curr;
        }
      }
      
    }
    setMenuData(newMenu);
    setCoursesUnits(newCoursesUnits);
    setDegreeUOC([currUOC, totalUOC]); 
    console.log(newMenu)
    console.log(specialisation)
  };

  return (
    <div className="container">
      {degreeUOC[0] === 0 ? (
        <SkeletonDashboard />
      ) : (
        <animated.div className="centered" style={props}>
          <LiquidProgressChart
            completedUOC={degreeUOC[0]}
            totalUOC={degreeUOC[1]}
          />
          <a
            href={`https://www.handbook.unsw.edu.au/undergraduate/programs/${currYear}/${degree["code"]}?year=${currYear}`}
            target="_blank"
            rel="noopener noreferrer"
            className="textLink"
          >
            <Title className="text textLink">{programCode} - {programName}</Title>
          </a>
          <div className="cards">
            {degree.concentrations && 
              degree.concentrations.map((concentration, index) => (
              <DegreeCard key={index} concentration={concentration} />
            ))}
          </div>
        </animated.div>
      )}
    </div>
  );
};


export default Dashboard;