export type LogReportFieldCodeGroup = "density" | "consistency" | "moisture"

export type LogReportFieldCodeSeed = {
  group: LogReportFieldCodeGroup
  code: string
  name: string
  aliases: string[]
}

export const LOG_REPORT_FIELD_CODE_SEEDS: LogReportFieldCodeSeed[] = [
  { group: "density", code: "VL", name: "Very Loose", aliases: ["vl", "very loose", "veryloose"] },
  { group: "density", code: "L", name: "Loose", aliases: ["l", "loose"] },
  { group: "density", code: "MD", name: "Medium Dense", aliases: ["md", "medium dense", "mediumdense", "medium"] },
  { group: "density", code: "D", name: "Dense", aliases: ["d", "dense"] },
  { group: "density", code: "VD", name: "Very Dense", aliases: ["vd", "very dense", "verydense"] },

  { group: "consistency", code: "VS", name: "Very Soft", aliases: ["vs", "very soft", "verysoft"] },
  { group: "consistency", code: "S", name: "Soft", aliases: ["s", "soft"] },
  { group: "consistency", code: "F", name: "Firm", aliases: ["f", "firm"] },
  { group: "consistency", code: "St", name: "Stiff", aliases: ["st", "stiff"] },
  { group: "consistency", code: "VSt", name: "Very Stiff", aliases: ["vst", "very stiff", "verystiff"] },
  { group: "consistency", code: "H", name: "Hard", aliases: ["h", "hard"] },
  { group: "consistency", code: "FR", name: "Friable", aliases: ["fr", "friable"] },

  { group: "moisture", code: "D", name: "Dry", aliases: ["d", "dry"] },
  { group: "moisture", code: "M", name: "Moist", aliases: ["m", "moist"] },
  { group: "moisture", code: "W", name: "Wet", aliases: ["w", "wet"] },
  { group: "moisture", code: "w < PL", name: "w < PL", aliases: ["w < pl", "w<pl"] },
  { group: "moisture", code: "w = PL", name: "w = PL", aliases: ["w = pl", "w=pl"] },
  { group: "moisture", code: "w > PL", name: "w > PL", aliases: ["w > pl", "w>pl"] },
  { group: "moisture", code: "w ≈ LL", name: "w ≈ LL", aliases: ["w ≈ ll", "w = ll", "w=ll", "w≈ll", "approximately ll"] },
  { group: "moisture", code: "w > LL", name: "w > LL", aliases: ["w > ll", "w>ll"] },
]

export const DCP_GRAPH_CHART_KEY = "dcp_graph"
export const DCP_GRAPH_COLUMN_CODE = "column_1734655921756"
export const DCP_TEST_SOURCE_GROUP = "all_testings"
export const DCP_TEST_SOURCE_VALUE = "DCP"

export function createDcpGraphChartSeries(columnCode = DCP_GRAPH_COLUMN_CODE) {
  return {
    chart_type: "scatter_line_chart",
    column_data_source: {
      group: DCP_TEST_SOURCE_GROUP,
      value: DCP_TEST_SOURCE_VALUE,
    },
    fill_color: "#83BEEC",
    line_color: "#83BEEC",
    line_type: "solid_around",
    chart_transparency_width: "20",
    chart_layer: "bottom",
    symbol_type: "circle",
    symbol_color: "#83BEEC",
    axis_bounds_min: 0,
    axis_bounds_max: "25",
    axis_units_minor: "5",
    axis_units_major: 2,
    axis_label: true,
    fontSize: 8,
    hide_chart_name_graphic: true,
    text_visibility: true,
    is_data_present: false,
    name_vertical: false,
    name_parent_vertical: false,
    text: "",
    code: columnCode,
    selectedMultiChartOptions: [
      {
        name: DCP_TEST_SOURCE_VALUE,
        code: columnCode,
        group_code: DCP_TEST_SOURCE_GROUP,
        data: "",
        chart_type: "scatter_line_chart",
        column_data_source: {
          group: DCP_TEST_SOURCE_GROUP,
          value: DCP_TEST_SOURCE_VALUE,
        },
        fill_color: "#83BEEC",
        line_color: "#83BEEC",
        line_type: "solid_around",
        chart_transparency_width: "20",
        chart_layer: "bottom",
        symbol_type: "symbol_01",
        symbol_color: "#000000",
        axis_bounds_min: 0,
        axis_bounds_max: "25",
        axis_units_minor: "5",
        axis_units_major: 2,
        axis_label: true,
        fontSize: 8,
        hide_chart_name_graphic: true,
        text_visibility: true,
        is_data_present: false,
        name_vertical: false,
        name_parent_vertical: false,
        text: "DCP Graph",
        line_visibility: true,
        symbol_visibility: true,
      },
    ],
    symbol_visibility: true,
    line_visibility: true,
    axis_order: 0,
  }
}

export type LogReportChartDefaultSeed = {
  chartKey: string
  columnCode: string
  columnText: string
  dataSourceGroup: string
  dataSourceValue: string
  config: ReturnType<typeof createDcpGraphChartSeries>
}

export const LOG_REPORT_CHART_DEFAULT_SEEDS: LogReportChartDefaultSeed[] = [
  {
    chartKey: DCP_GRAPH_CHART_KEY,
    columnCode: DCP_GRAPH_COLUMN_CODE,
    columnText: "DCP Graph",
    dataSourceGroup: DCP_TEST_SOURCE_GROUP,
    dataSourceValue: DCP_TEST_SOURCE_VALUE,
    config: createDcpGraphChartSeries(),
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

/** Clone a stored DCP series and stamp the column code onto nested chart options. */
export function cloneDcpGraphChartSeries(
  config: unknown,
  columnCode = DCP_GRAPH_COLUMN_CODE
): ReturnType<typeof createDcpGraphChartSeries> {
  const fallback = createDcpGraphChartSeries(columnCode)
  const source = isRecord(config) ? config : fallback
  const cloned = structuredClone(source) as ReturnType<typeof createDcpGraphChartSeries>
  cloned.code = columnCode
  cloned.selectedMultiChartOptions = (cloned.selectedMultiChartOptions ?? []).map((option) => ({
    ...option,
    code: columnCode,
  }))
  return cloned
}
