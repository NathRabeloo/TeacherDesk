export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="text-green-600 border-l-2 border-green-600 px-4">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="text-red-500 border-l-2 border-red-500 px-4 font-medium">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="text-foreground border-l-2 px-4">{message.message}</div>
      )}
    </div>
  );
}

