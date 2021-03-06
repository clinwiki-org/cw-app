import * as React from 'react';
import { gql } from 'apollo-boost';
import { Mutation, MutationFn, MutationResult } from 'react-apollo';
import {
  CreateSiteMutation as CreateSiteMutationType,
  CreateSiteMutationVariables,
} from 'types/CreateSiteMutation';
import SiteItem from 'components/SiteItem';
import { SiteItemFragment } from 'types/SiteItemFragment';
import { lensPath, set } from 'ramda';
import { CreateSiteOwnSitesQuery } from 'types/CreateSiteOwnSitesQuery';
import SiteProvider from 'containers/SiteProvider';

interface CreateSiteMutationProps {
  children: (
    mutate: CreateSiteMutationFn,
    result: MutationResult<CreateSiteMutationType>,
  ) => React.ReactNode;
}

const CREATE_SITE_MUTATION = gql`
  mutation CreateSiteMutation($input: CreateSiteInput!) {
    createSite(input: $input) {
      site {
        ...SiteFragment
      }
      errors
    }
  }

  ${SiteProvider.fragment}
`;

class CreateSiteMutationComponent extends Mutation<
  CreateSiteMutationType,
  CreateSiteMutationVariables
> {}
export type CreateSiteMutationFn = MutationFn<
  CreateSiteMutationType,
  CreateSiteMutationVariables
>;

const OWN_SITES_QUERY = gql`
  query CreateSiteOwnSitesQuery {
    me {
      id
      ownSites {
        ...SiteItemFragment
      }
    }
  }

  ${SiteItem.fragment}
`;

class CreateSiteMutation extends React.PureComponent<CreateSiteMutationProps> {
  render() {
    return (
      <CreateSiteMutationComponent
        mutation={CREATE_SITE_MUTATION}
        update={(cache, { data }) => {
          if (!data || !data.createSite || !data.createSite.site) return;
          let currentData: CreateSiteOwnSitesQuery | null;
          try {
            currentData = cache.readQuery({
              query: OWN_SITES_QUERY,
            });
          } catch {
            // This means the data for ownStores was not fetched yet
            return;
          }

          if (!currentData || !currentData.me) return;
          const ownStoresLens = lensPath([
            'me',
            'ownSites',
            currentData.me!.ownSites.length,
          ]);
          const newData = set(ownStoresLens, data.createSite.site, currentData);
          cache.writeQuery({ query: OWN_SITES_QUERY, data: newData });
        }}
      >
        {this.props.children}
      </CreateSiteMutationComponent>
    );
  }
}

export default CreateSiteMutation;
