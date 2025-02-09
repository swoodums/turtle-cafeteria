/* frontend/sr/components/schedule/EditScheduleModal.tsx */

import React from "react";
import {
  Schedule,
  ScheduleUpdate,
  MealType,
} from "@/types/schedules/schedule.types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Stack,
  TextField,
  MenuItem,
  Box,
  DialogActions,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import scheduleService from "@/services/scheduleService";

interface EditScheduleModalProps {
  schedule: Schedule;
  open: boolean;
  onClose: () => void;
}

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export default function EditScheduleModal({
  schedule,
  open,
  onClose,
}: EditScheduleModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = React.useState<ScheduleUpdate>({
    start_date: schedule.start_date,
    end_date: schedule.end_date,
    meal_type: schedule.meal_type || "dinner",
    notes: schedule.notes,
  });

  //Reset form when modal opens with new schedule
  React.useEffect(() => {
    setFormData({
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      meal_type: schedule.meal_type || "dinner",
      notes: schedule.notes,
    });
  }, [schedule]);

  const updateMutation = useMutation({
    mutationFn: (data: ScheduleUpdate) =>
      scheduleService.updateSchedule(schedule.id, data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["schedules"],
      });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange =
    (field: keyof ScheduleUpdate) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Schedule</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange("start_date")}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange("end_date")}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <TextField
              select
              label="Meal Type"
              value={formData.meal_type}
              onChange={handleInputChange("meal_type")}
              fullWidth
            >
              {MEAL_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="notes"
              value={formData.notes ?? ""}
              onChange={handleInputChange("notes")}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
