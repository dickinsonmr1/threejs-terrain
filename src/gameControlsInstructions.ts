export class GameControlsInstructions extends HTMLElement {
  connectedCallback(): void {
    this.innerHTML = `
      <p class="controls-info">
        KEYBOARD/MOUSE CONTROLS:<br/>
        Move: WASD / Arrow Keys<br/>
        Turbo: Move + Shift<br/>
        Elevation: QZ<br/>
        Look: MOUSE<br/>
        <br/>
        TOUCH CONTROLS:<br/>
        Left pad: Move<br/>
        Right pad: Look<br/>
      </p>
    `;
  }
}

// Register as custom element
customElements.define('game-controls', GameControlsInstructions);