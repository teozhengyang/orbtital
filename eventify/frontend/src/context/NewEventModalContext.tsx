import { createContext, useState } from 'react';
import { Event, emptyEvent } from '../utils/Types';

const NewEventModalContext = createContext({
  showModal: false,
  setShowModal: (input: boolean) => {},
  selectedDate: new Date(),
  setSelectedDate: (input: Date) => {},
  selectedEvent: emptyEvent,
  setSelectedEvent: (input: Event) => {},
  activityModal: false,
  setActivityModal: (input: boolean) => {},
})

export default NewEventModalContext;

export const ModalProvider = ({children}: {children: React.ReactNode}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(emptyEvent);
  const [activityModal, setActivityModal] = useState(false);

  return (
    <NewEventModalContext.Provider value={{ showModal, setShowModal, selectedDate, setSelectedDate, selectedEvent, setSelectedEvent, activityModal, setActivityModal }}>
      {children}
    </NewEventModalContext.Provider>
  )
}