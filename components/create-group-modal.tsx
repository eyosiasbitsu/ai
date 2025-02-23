interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const CreateGroupModal = ({
  isOpen,
  onClose,
  isLoading = false
}: CreateGroupModalProps) => {
  // ... existing code ...

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Group Chat</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* ... existing form fields ... */}
            <div className="flex justify-end">
              <Button disabled={isLoading}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 