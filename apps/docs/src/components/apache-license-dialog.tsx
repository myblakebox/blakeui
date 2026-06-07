"use client";

import {Button, Modal} from "@blakeui/react";

import {APACHE_LICENSE_2_0} from "./apache-license";

/**
 * Inline trigger that renders the text "Apache License 2.0" as a link and opens
 * a modal containing the full Apache License 2.0 text.
 */
export function ApacheLicense() {
  return (
    <Modal>
      <Button
        className="text-fd-primary inline h-auto min-h-0 bg-transparent p-0 align-baseline text-base font-medium underline hover:bg-transparent"
        variant="ghost"
      >
        Apache License 2.0
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-2xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Apache License 2.0</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <pre className="max-h-[60vh] overflow-auto text-xs leading-relaxed wrap-break-word whitespace-pre-wrap text-muted">
                {APACHE_LICENSE_2_0}
              </pre>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
