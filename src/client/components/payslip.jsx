import { useState } from "react";

export default function Payslip({ income, onAccept }) {
  const [tax, setTax] = useState("");
  const [ni, setNI] = useState("");
  const [open, setOpen] = useState(false);
  const [openedFully, setOpenedFully] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  
  const formatGBP = (value) =>
    `£${Number(value).toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const correctTax = +(income * 0.2).toFixed(2);
  const correctNI = +(income * 0.1).toFixed(2);

  const isCorrect =
    Math.abs(Number(tax) - correctTax) < 0.01 &&
    Math.abs(Number(ni) - correctNI) < 0.01;

  const netPay = +(income - correctTax - correctNI).toFixed(2);

  return (
    <div className="payslipOverlay">
      <div className="payslipWrapper">

        {!openedFully ? (
          <div
            className={`payslipEnvelope ${open ? "open" : ""} ${
              fadingOut ? "fadeOut" : ""
            }`}
            onClick={() => {
              if (!open) {
                setOpen(true);

                setTimeout(() => {
                  setFadingOut(true);
                }, 650);

                setTimeout(() => {
                  setOpenedFully(true);
                }, 900);
              }
            }}
          >
            <div className="envelopeShell">

              <div className="envelopeBack" />

              {/* LETTER */}
              <div className="payslipLetter">
                <div className="payslipCard">

                  <h2>Payslip</h2>

                  <div className="payslipRow">
                    <span>Gross Pay</span>
                    <strong>{formatGBP(income)}</strong>
                  </div>

                  <div className="payslipRow">
                    <div className="payslipLabel">
                      <span>Income Tax</span>
                      <small className="payslipHint">
                        20% of {formatGBP(income)}
                      </small>
                    </div>

                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      className="payslipInput"
                    />
                  </div>

                  <div className="payslipRow">
                    <div className="payslipLabel">
                      <span>National Insurance</span>
                      <small className="payslipHint">
                        10% of {formatGBP(income)}
                      </small>
                    </div>

                    <input
                      type="number"
                      value={ni}
                      onChange={(e) => setNI(e.target.value)}
                      className="payslipInput"
                    />
                  </div>

                  <div className="payslipDivider" />

                  <div className="payslipRow">
                    <span>Net Pay</span>
                    <strong>{formatGBP(netPay)}</strong>
                  </div>

                  <button
                    className="btn primary"
                    onClick={() => onAccept(netPay)}
                    disabled={!isCorrect}
                  >
                    {isCorrect
                      ? "Confirm & Receive Pay"
                      : "Enter correct values"}
                  </button>

                </div>
              </div>

              {/* FRONT */}
              <div className="envelopeFrontLeft" />
              <div className="envelopeFrontRight" />

              {/* FLAP */}
              <div className="envelopeFlapTop" />

              {/* STAMP */}
              <div className="envelopeStamp">£</div>

            </div>
          </div>
        ) : (
          <div className="payslipCard">

            <h2>Payslip</h2>

            <div className="payslipRow">
              <span>Gross Pay</span>
              <strong>{formatGBP(income)}</strong>
            </div>

            <div className="payslipRow">
              <div className="payslipLabel">
                <span>Income Tax</span>
                <small className="payslipHint">
                  20% of {formatGBP(income)}
                </small>
              </div>

              <input
                type="number"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="payslipInput"
              />
            </div>

            <div className="payslipRow">
              <div className="payslipLabel">
                <span>National Insurance</span>
                <small className="payslipHint">
                  10% of {formatGBP(income)}
                </small>
              </div>

              <input
                type="number"
                value={ni}
                onChange={(e) => setNI(e.target.value)}
                className="payslipInput"
              />
            </div>

            <div className="payslipDivider" />

            <div className="payslipRow">
              <span>Net Pay</span>
              <strong>{formatGBP(netPay)}</strong>
            </div>

            <button
              className="btn primary"
              onClick={() => onAccept(netPay)}
              disabled={!isCorrect}
            >
              {isCorrect
                ? "Confirm & Receive Pay"
                : "Enter correct values"}
            </button>

          </div>
        )}

        {!open && <div className="openHint">Click to open</div>}

      </div>
    </div>
  );
}