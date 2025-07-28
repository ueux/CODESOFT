import dynamic from "next/dynamic";
import React, { useState } from "react";
import { Smile, Send, Image as ImageIcon } from "lucide-react";

const EmojiPicker = dynamic(
  () =>
    import("emoji-picker-react").then(
      (mod) => mod.default as React.FC<any>
    ),
  {
    ssr: false,
  }
);

interface ChatInputProps {
  onSendMessage: (e: React.FormEvent) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  darkMode?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  message,
  setMessage,
  darkMode = false
}) => {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Uploading image:", file.name);
      // Handle image upload logic here
    }
  };

  // Theme classes
  const containerClasses = ` px-4 py-3 flex items-center gap-2 ${
    darkMode
      ? "border-gray-700 bg-gray-800"
      : "border-gray-200 bg-white"
  }`;

  const iconClasses = `w-5 h-5 ${
    darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600"
  }`;

  const buttonClasses = `p-2 rounded-md ${
    darkMode
      ? "hover:bg-gray-700 text-gray-400"
      : "hover:bg-gray-100"
  }`;

  const inputClasses = `flex-1 px-4 py-2 text-sm border outline-none rounded-md ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
      : "border-gray-200"
  }`;

  const sendButtonClasses = `p-2 rounded-md transition ${
    darkMode
      ? "bg-blue-600 hover:bg-blue-500 text-gray-100"
      : "bg-blue-600 hover:bg-blue-700 text-white"
  }`;

  return (
    <form
      onSubmit={onSendMessage}
      className={containerClasses}
    >
      {/* Upload Icon */}
      <label className={`cursor-pointer ${buttonClasses}`}>
        <ImageIcon className={iconClasses} />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          hidden
        />
      </label>

      {/* Emoji Picker Toggle */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className={buttonClasses}
        >
          <Smile className={iconClasses} />
        </button>
        {showEmoji && (
          <div className="absolute bottom-12 left-0 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={darkMode ? "dark" : "light"}
              width={300}
              height={350}
            />
          </div>
        )}
      </div>

      {/* Message Input */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className={inputClasses}
      />

      {/* Send Button */}
      <button
        type="submit"
        className={sendButtonClasses}
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default ChatInput;