"use client";

import { useRef } from "react";
import PitchForm from "./PitchForm";

export default function RequestConversation() {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="request" onClick={() => dialog.current?.showModal()}>
        Request a conversation
      </button>
      <dialog
        ref={dialog}
        className="notes"
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      >
        <div className="notes-inner">
          <button type="button" className="close" onClick={() => dialog.current?.close()} aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <h3>Request a conversation</h3>
          <div className="request-form">
            <PitchForm />
          </div>
        </div>
      </dialog>
    </>
  );
}
