import React from "react";

interface Action {
    name: string;
    label: string;
    color?: "red" | "blue" | "green";
}

interface GenericTableProps {
    data: Record<string, any>[];
    columns: string[];
    actions: Action[];
    onAction: (name: string, item: Record<string, any>) => void;
    columnHeaders?: Record<string, string>;
    getActions?: (item: Record<string, any>) => Action[];
}

const GenericTable: React.FC<GenericTableProps> = ({ data, columns, actions, onAction, columnHeaders, getActions }) => {
    const getHeaderLabel = (col: string): string => {
        if (columnHeaders && columnHeaders[col]) {
            return columnHeaders[col];
        }
        return col.charAt(0).toUpperCase() + col.slice(1);
    };

    const getActionColor = (action: Action): string => {
        const color = action.color || "blue";
        switch (color) {
            case "red":
                return "text-red-500 hover:bg-red-100";
            case "green":
                return "text-green-500 hover:bg-green-100";
            case "blue":
            default:
                return "text-blue-500 hover:bg-blue-100";
        }
    };
    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            {columns.map((col, index) => (
                                <th
                                    key={col}
                                    className={`py-4 px-4 font-medium text-black dark:text-white ${
                                        index === 0 ? "min-w-[220px] xl:pl-11" : "min-w-[150px]"
                                    }`}
                                >
                                    {getHeaderLabel(col)}
                                </th>
                            ))}
                            <th className="py-4 px-4 font-medium text-black dark:text-white">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={col}
                                        className={`border-b border-[#eee] py-5 px-4 dark:border-strokedark ${
                                            colIndex === 0 ? "pl-9 xl:pl-11" : ""
                                        }`}
                                    >
                                        <p className="text-black dark:text-white">
                                            {item[col]}
                                        </p>
                                    </td>
                                ))}

                                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                    <div className="flex items-center gap-2">
                                        {(getActions ? getActions(item) : actions).map((action) => (
                                            <button
                                                key={action.name}
                                                onClick={() => onAction(action.name, item)}
                                                type="button"
                                                className={`rounded-md border border-stroke px-2 py-1 text-xs font-medium transition
                                                    hover:bg-gray-2 dark:border-strokedark ${getActionColor(action)}
                                                `}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GenericTable;