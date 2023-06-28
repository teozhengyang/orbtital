import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModalActivity from "./ModalActivity";
import AuthContext from "../context/AuthContext";
import NewEventModalContext from "../context/NewEventModalContext";
import axios from "axios";
import { Button, ButtonGroup } from "react-bootstrap";
import { format, addDays, subDays } from "date-fns";
import { Event, Activity, AuthUser, AuthToken } from "src/utils/Types";
import "/static/css/display.css";
import "/static/css/timetable.css";

// Temporary activity display until we either figure out timetable display or use an external one
export default function DisplayActivity({event}: {event: Event}) {
  const { activityModal, setActivityModal, setSelectedActivity } = useContext(NewEventModalContext)
  const { authTokens, user } = useContext(AuthContext) as { authTokens: AuthToken, user: AuthUser }

  const [activities, setActivities] = useState<Array<Activity>>([])
  const [currentDay, setCurrentDay] = useState<Date>(new Date(new Date(event.start).setHours(0, 0, 0, 0)))
  const [filteredAct, setFilteredAct] = useState<Array<Activity>>([])

  // Headers for authorization @ backend => Allows request to django
  const config = {
    headers:{'Authorization': 'Bearer ' + String(authTokens.access)},
    params:{'EventID': event.id},
  }

  // Update activity list when page first rendered or activity submitted via activity modal
  useEffect(() => {
    fetchActivity();
  }, [activityModal]);

  // Update displayed activities based on current date of calendar
  useEffect(() => {
    const list = activities.filter((activity:Activity) => {
      const curr = currentDay.valueOf()
      const start = new Date(activity.start).setHours(0, 0, 0, 0).valueOf()
      const end = new Date(activity.end).setHours(0, 0, 0, 0).valueOf()
      return curr >= start && curr <= end
    })
    setFilteredAct(list)
  }, [currentDay, activities])

  
  // setHours() mutate the Date object, so must create new Date object each time
  const nextDay = () => {
    if (currentDay.valueOf() < new Date(event.end).setHours(0, 0, 0, 0).valueOf()) {
      setCurrentDay(addDays(currentDay, 1))
    }
  }
  const prevDay = () => {
    if (currentDay.valueOf() > new Date(event.start).setHours(0, 0, 0, 0).valueOf()) {
      setCurrentDay(subDays(currentDay, 1))
    }
  }

  const fetchActivity = async () => {
    try {
      const response = await axios.get('/api/activities/', config);
      console.log(response.data)
      setActivities(response.data)
    } catch (error) {
      console.error(error);
    }
  };

  function isOutOfBounds(activity:Activity) {
    if (new Date(activity.start).valueOf() < new Date(event.start).valueOf() || new Date(activity.end).valueOf() > new Date(event.end).valueOf()) {
      return "red";
    }
    return "green";
  }


  // Leaving here temporarily if we still want table display somewhere for activities
/*  
  const activityDisplay = (
    <div>
      <table>
        <thead>
          <tr className="table-head">
            <th>Name</th>
            <th>Description</th>
            <th>Start</th>
            <th>End</th>
            <th>Location</th>
            <th>Budget</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {activities.map((activity:Activity, i) => (
            <tr key={i} className="table-row" style={{color:"green"}}>
              <td>{activity.name}</td>
              <td>{activity.description}</td>
              <td>{format(new Date(activity.start), "dd/MM/yyyy, p")}</td>
              <td>{format(new Date(activity.end), "dd/MM/yyyy, p")}</td>
              <td>{activity.location}</td>
              <td>${activity.budget}</td>
              <td>
                <ButtonGroup>
                  <Button disabled={!isOrganiser} onClick={() => navigate('/EditActivity', {state:{act:activity, evt:event}})}>
                    Edit
                  </Button>
                  <Button disabled={!isOrganiser} onClick={async() => {
                    const response = await axios.delete(`http://127.0.0.1:8000/activities/${activity.id}/`, {headers:{'Authorization': 'Bearer ' + String(authTokens.access)}})
                    fetchActivity()
                    console.log(response)
                  }}>
                    Delete
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
*/

  return (
    <div style={{overflow: "scroll"}}>
      <ModalActivity event={event}/>

      <p style={{color:"red"}}>Minor visual bug when setting activity end time to  of a day and viewing timetable of that day</p>

      <header className="display-header">
        <div id="display-title">
          <Button onClick={prevDay}>&lt;</Button>
          <h4 style={{width:"8em", textAlign:"center"}}>{currentDay.toDateString()}</h4>
          <Button onClick={nextDay}>&gt;</Button>
        </div>
        <Button disabled={!event.organizers?.includes(user.user_id)} onClick={() => setActivityModal(true)}>
          Add Activity
        </Button>
      </header>

      <div className="display-container">
          <ul className="timeslots">
            {Array.from(Array(24).keys()).map((hour) => {
              if (hour < 10) {
                return <li key={hour}>{"0" + hour + "00"}</li>
              } else {
                return <li key={hour}>{hour + "00"}</li>
              }
            })}
          </ul>
          <div className="activity-container" onClick={() => setActivityModal(true)}>
              {filteredAct.map((activity:Activity, i) => {
                const columnNo = (time:Date) => {
                  return time.getHours() * 4 + (time.getMinutes() / 15) + 1 
                }
                const leftBound = new Date(activity.start).valueOf() < currentDay.valueOf()
                  ? 1
                  : columnNo(new Date(activity.start))
                const rightBound = new Date(activity.end).valueOf() >= addDays(currentDay, 1).valueOf()
                  ? 97
                  : columnNo(new Date(activity.end))
                const colors = isOutOfBounds(activity)
                const columnInfo = {
                  gridColumnStart: leftBound,
                  gridColumnEnd: rightBound,
                  backgroundColor: colors,
                }
                return (
                  <div key={i} className="slot" style={columnInfo} onClick={() => setSelectedActivity(activity)}>
                    <p>{activity.name}</p>
                  </div>
                )
              })}
          </div>
      </div>
    </div>
  )
}