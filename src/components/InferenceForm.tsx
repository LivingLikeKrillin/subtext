import { useState } from "react";

interface Props {
  disabled: boolean;
  onSubmit: (inputText: string) => void;
}

export function InferenceForm({ disabled, onSubmit }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText("");
    }
  };

  return (
    <form className="inference-form" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text for inference..."
        rows={3}
        disabled={disabled}
      />
      <button className="btn btn-primary" type="submit" disabled={disabled || !text.trim()}>
        Run Inference
      </button>
    </form>
  );
}
