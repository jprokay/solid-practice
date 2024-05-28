import { MergeDeep } from "type-fest";
import { Database as Generated } from "./supabase";
export type { Json } from "./supabase";

export type Database = MergeDeep<
	Generated,
	{
		public: {
			Views: {
				loops: {
					Insert: {
						loop_end_minute: number;
						loop_end_second: number;
						loop_name: string | null;
						loop_start_minute: number;
						loop_start_second: number;
						video_id: string;
					};
					Update: {
						loop_end_minute: number;
						loop_end_second: number;
						loop_id: string;
						loop_name: string | null;
						loop_start_minute: number;
						loop_start_second: number;
						video_id: string;
					};
				};
			};
		};
	}
>;
