import { Grid, IconButton, Toolbar, Typography } from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import * as React from "react";
import { IPagingInfo } from "./paging/IPagingInfo";

interface IProps {
    totalCount: number;
    pagingInfo: IPagingInfo;
    rowName?: string | ((count: number) => string);
}

export const TablePagination: React.FunctionComponent<IProps> = ({ totalCount, pagingInfo, rowName }) => {
    if (typeof rowName === "function") {
        rowName = rowName(totalCount);
    }
    return (
        <TableCell colSpan={1000}>
            <Toolbar>
                <Grid container justify="space-between" alignItems="center">
                    <Grid item>
                        <Typography color="textPrimary" variant="body2">
                            {totalCount} {rowName}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Grid container alignItems="center" spacing={2}>
                            {pagingInfo.totalPages && pagingInfo.currentPage && (
                                <Grid item>
                                    <Typography color="textSecondary" variant="body2">
                                        Seite {pagingInfo.currentPage} von {pagingInfo.totalPages}
                                    </Typography>
                                </Grid>
                            )}
                            <Grid item>
                                <IconButton disabled={!pagingInfo.fetchPreviousPage} onClick={() => pagingInfo.fetchPreviousPage!()}>
                                    <KeyboardArrowLeft />
                                </IconButton>
                                <IconButton disabled={!pagingInfo.fetchNextPage} onClick={() => pagingInfo.fetchNextPage!()}>
                                    <KeyboardArrowRight />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Toolbar>
        </TableCell>
    );
};
