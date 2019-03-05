import { InputBaseProps } from "@material-ui/core/InputBase";
import Popover from "@material-ui/core/Popover";
import DateRangeIcon from "@material-ui/icons/DateRange";
import LocaleContext from "@vivid-planet/react-admin-date-fns/LocaleContext";
import styled from "@vivid-planet/react-admin-mui/styled-components";
import { format } from "date-fns";
import * as de from "date-fns/locale/de";
import * as React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { FieldRenderProps } from "react-final-form";
import { StyledInput } from "./Input";

registerLocale("de", de);

export const ExtendedStyledInput = styled<InputBaseProps>(StyledInput)`
    & input {
        cursor: default;
    }
`;

const DateRange: React.FunctionComponent<InputBaseProps & FieldRenderProps> = ({ meta, input, innerRef, ...props }) => {
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [endDate, setEndDate] = React.useState<Date | null>(null);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const locale = React.useContext(LocaleContext);

    let formattedValue = "";
    if (input.value) {
        if (input.value.start) formattedValue += format(input.value.start, "P", { locale });
        formattedValue += " - ";
        if (input.value.end) formattedValue += format(input.value.end, "P", { locale });
    }
    return (
        <>
            <ExtendedStyledInput
                {...input}
                {...props}
                value={formattedValue}
                readOnly={true}
                endAdornment={<DateRangeIcon />}
                autoComplete="off"
                onClick={event => {
                    setAnchorEl(event.currentTarget);
                }}
            />
            <Popover
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                <DatePicker
                    inline
                    locale="de"
                    selected={startDate}
                    selectsStart
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    onChange={e => {
                        setStartDate(e);
                        input.onChange({
                            start: e,
                            end: endDate,
                        });
                    }}
                />
                <DatePicker
                    inline
                    locale="de"
                    selected={endDate}
                    selectsEnd
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    onChange={e => {
                        setEndDate(e);
                        input.onChange({
                            start: startDate,
                            end: e,
                        });
                    }}
                />
            </Popover>
        </>
    );
};

export default DateRange;
