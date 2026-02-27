import {
    answer,
    getElements,
    getEvent,
    onElementResults,
    onEventState,
    onEventUpdated,
    onElementPublished,
    onElementStateChanged,
    type InteractElement,
    type InteractEvent,
} from "@monterosa/sdk-interact-kit";
import { useEffect, useState } from "react";
import { useNotification } from "../contexts/NotificationContext";
import {
    INTERACT_EVENT_LOAD_ERROR_TOAST,
    INTERACT_VOTE_FAILED_ERROR_TOAST,
} from "../constants/messages";
import "./InteractEventView.css";

function InteractEventView({ eventId }: { eventId: string }) {
    const { addNotification } = useNotification();
    const [event, setEvent] = useState<InteractEvent | null>(null);
    const [elements, setElements] = useState<InteractElement[]>([]);
    const [, setTick] = useState(0);
    const forceUpdate = () => setTick((t) => t + 1);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const evt = await getEvent(eventId);
                if (evt) {
                    setEvent(evt);
                }
            } catch (error) {
                console.error(error);
                addNotification(INTERACT_EVENT_LOAD_ERROR_TOAST, "error");
            }
        };

        fetchEvent();
    }, [eventId, addNotification]);

    useEffect(() => {
        if (!event) return;

        const unsubs: Array<() => void> = [];

        const fetchElements = async () => {
            try {
                const els = await getElements(event);
                if (els) {
                    setElements(els);

                    for (const el of els) {
                        unsubs.push(
                            onElementResults(el, () => {
                                // console.log("Results updated for element", el.id, el.results);
                                setElements((prev) => [...prev]);
                            }),
                        );
                        unsubs.push(
                            onElementStateChanged(el, () => {
                                // console.log("Element state changed:", el.id, el.state);
                                setElements((prev) => [...prev]);
                            }),
                        );
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchElements();

        unsubs.push(
            onEventState(event, () => {
                // console.log("Event state changed:", event.state);
                forceUpdate();
            }),
        );

        unsubs.push(
            onEventUpdated(event, () => {
                // console.log("Event data updated");
                forceUpdate();
            }),
        );

        unsubs.push(
            onElementPublished(event, (newElement) => {
                // console.log("New element published:", newElement.id);
                setElements((prev) => [...prev, newElement]);
            }),
        );

        return () => {
            unsubs.forEach((unsub) => unsub());
        };
    }, [event]);

    const handleAnswerOptionClick = (element: InteractElement, optionIndex: number) => {
        try {
            answer(element, optionIndex);
        } catch (error) {
            console.error("Vote failed:", error);
            addNotification(INTERACT_VOTE_FAILED_ERROR_TOAST, "error");
        }
    };

    return (
        <div className="interact-event-view">
            {event && (
                <div className="iev-header">
                    <div className="iev-header-info">
                        <h3 className="iev-event-name">{event.name}</h3>
                        <p className="iev-event-time">
                            Ends: {new Date(event.endAt * 1000).toLocaleString()}
                        </p>
                    </div>
                    <span className={`iev-state-badge iev-state--${event.state}`}>
                        {event.state}
                    </span>
                </div>
            )}

            {elements.length === 0 && event && (
                <p className="iev-empty">No elements published yet.</p>
            )}

            {elements.map((el) => (
                <div key={el.id} className="iev-element">
                    <div className="iev-element-header">
                        <span className="iev-element-type">{el.contentType || el.type}</span>
                        <span className={`iev-element-state iev-element-state--${el.state}`}>
                            {el.state}
                        </span>
                    </div>

                    {el.question && (
                        <p className="iev-question">
                            {(el.question as Record<string, string>).text}
                        </p>
                    )}

                    {el.answerOptions && (
                        <div className="iev-options">
                            {el.answerOptions.map((option, index) => {
                                const result = el.results?.[index];
                                return (
                                    <button
                                        key={index}
                                        className={`iev-option ${el.hasBeenAnswered ? 'iev-option--voted' : ''}`}
                                        onClick={() => handleAnswerOptionClick(el, index)}
                                        disabled={el.state === "closed" || !el.interactive || el.hasBeenAnswered}
                                    >
                                        <span>{el.hasBeenAnswered ? 'Voted' : 'Vote'}</span>
                                        <span className="iev-option-text">
                                            {(option as Record<string, string>).text}
                                        </span>
                                        {result && (
                                            <span className="iev-option-result">
                                                {result.percentage}% · {result.votes} votes
                                            </span>
                                        )}
                                        {result && (
                                            <div
                                                className="iev-option-bar"
                                                style={{ width: `${result.percentage}%` }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default InteractEventView;
