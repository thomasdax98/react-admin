import { ApolloProvider } from "@apollo/react-hooks";
import { storiesOf } from "@storybook/react";
import {
    createRestPagingActions,
    SortDirection,
    Table,
    TableFilterFinalForm,
    TableQuery,
    useTableQuery,
    useTableQueryFilter,
    useTableQueryPaging,
    useTableQuerySort,
} from "@vivid-planet/react-admin-core";
import { Field, FieldContainerLabelAbove, Input } from "@vivid-planet/react-admin-form";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { RestLink } from "apollo-link-rest";
import gql from "graphql-tag";
import * as qs from "qs";
import * as React from "react";

const gqlRest = gql;

const query = gqlRest`
query users(
    $pathFunction: any
    $page: Int
    $sort: String
    $order: String
    $query: String
) {
    users(
        page: $page
        sort: $sort
        order: $order
        query: $query
    ) @rest(type: "UsersPayload", pathBuilder: $pathFunction) {
        meta @type(name: "UsersMeta") {
            totalCount
            links
        }
        data @type(name: "User") {
            id
            name
            username
            email
        }
    }
}
`;

interface IQueryData {
    users: {
        meta: {
            totalCount: number;
            links: IResponseLinks;
        };
        data: Array<{
            id: number;
            name: string;
            username: string;
            email: string;
        }>;
    };
}

function pathFunction({ args }: { args: { [key: string]: any } }) {
    interface IPathMapping {
        [arg: string]: string;
    }
    const paramMapping: IPathMapping = {
        query: "q",
        page: "_page",
        sort: "_sort",
        order: "_order",
    };

    const q = Object.keys(args).reduce((acc: { [key: string]: any }, key: string): { [key: string]: any } => {
        if (paramMapping[key] && args[key]) {
            acc[paramMapping[key]] = args[key];
        }
        return acc;
    }, {});
    return "users?_limit=5&" + qs.stringify(q, { arrayFormat: "brackets" });
}

interface IVariables extends IFilterValues {
    pathFunction: any;
    page: number;
    sort: string;
    order: string;
}
interface IFilterValues {
    query?: string;
}

function Story() {
    const filterApi = useTableQueryFilter<IFilterValues>({});

    const pagingApi = useTableQueryPaging(1);
    const sortApi = useTableQuerySort({
        columnName: "name",
        direction: SortDirection.ASC,
    });
    const { tableData, api, loading, error } = useTableQuery<IQueryData, IVariables>()(query, {
        variables: {
            pathFunction,
            sort: sortApi.current.columnName,
            order: sortApi.current.direction,
            page: pagingApi.current,
            ...filterApi.current,
        },
        resolveTableData: data => ({
            data: data.users.data,
            totalCount: data.users.meta.totalCount,
            pagingInfo: createRestPagingActions(
                pagingApi,
                {
                    nextPage: data.users.meta.links.next,
                    previousPage: data.users.meta.links.prev,
                    totalPages: data.users.meta.totalCount / 5,
                },
                {
                    pageParameterName: "_page",
                },
            ),
        }),
    });

    return (
        <TableQuery api={api} loading={loading} error={error}>
            {tableData && (
                <>
                    <TableFilterFinalForm<IFilterValues> filterApi={filterApi}>
                        <Field
                            name="query"
                            type="text"
                            label="Query"
                            component={Input}
                            fullWidth
                            fieldContainerComponent={FieldContainerLabelAbove}
                        />
                    </TableFilterFinalForm>
                    <Table
                        sortApi={sortApi}
                        {...tableData}
                        columns={[
                            {
                                name: "name",
                                header: "Name",
                                sortable: true,
                            },
                            {
                                name: "username",
                                header: "Username",
                                sortable: true,
                            },
                            {
                                name: "email",
                                header: "E-Mail",
                                sortable: true,
                            },
                        ]}
                    />
                </>
            )}
        </TableQuery>
    );
}

interface IResponseLinks {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
}
storiesOf("react-admin-core", module)
    .addDecorator(story => {
        const link = ApolloLink.from([
            new RestLink({
                uri: "https://jsonplaceholder.typicode.com/",
                responseTransformer: async response => {
                    const links: IResponseLinks = {};
                    const linkMatches = response.headers.get("link").match(/<(.*?)>; rel="(.*?)"/g) || [];
                    linkMatches.forEach((i: string) => {
                        const m = i.match(/<(.*?)>; rel="(.*?)"/);
                        if (m) {
                            links[m[2] as keyof IResponseLinks] = m[1];
                        }
                    });
                    return {
                        data: await response.json(),
                        meta: {
                            links,
                            totalCount: response.headers.get("x-total-count"),
                        },
                    };
                },
            }),
        ]);

        const cache = new InMemoryCache();

        const client = new ApolloClient({
            link,
            cache,
        });

        return <ApolloProvider client={client}>{story()}</ApolloProvider>;
    })
    .add("Table Filter Paging Sort", () => <Story />);
