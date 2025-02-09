import { api } from "./api";
import {
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
} from "@/types/schedules/schedule.types";

export default {
  getSchedulesByDateRange,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};

async function getSchedulesByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<Schedule[]> {
  const { data } = await api.get<Schedule[]>("/schedule/range/", {
    params: {
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    },
  });
  return data;
}

async function createSchedule(
  recipeId: number,
  schedule: ScheduleCreate,
): Promise<Schedule> {
  const { data } = await api.post<Schedule>(
    `/schedule/recipe/${recipeId}`,
    schedule,
  );
  return data;
}

async function updateSchedule(
  scheduleId: number,
  schedule: ScheduleUpdate,
): Promise<Schedule> {
  const { data } = await api.put<Schedule>(`/schedule/${scheduleId}`, schedule);
  return data;
}

async function deleteSchedule(scheduleId: number): Promise<void> {
  await api.delete(`/schedule/${scheduleId}`);
}
