import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'szipan',
  authorAddress: 'szipan@outlook.com',
  cdkVersion: '2.83.1',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'frontend-app-deployer',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/szipan/frontend-app-deployer.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();