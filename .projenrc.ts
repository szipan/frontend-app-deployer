import { awscdk } from 'projen';
const version = '1.0.0';
const tempDirectories = ["cdk.context.json", ".cdk.staging/", "frontend/", "cdk.out/", "test/"];

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'szipan',
  authorAddress: 'szipan@outlook.com',
  cdkVersion: '2.83.1',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'frontend-app-deployer',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/szipan/frontend-app-deployer.git',
  publishToPypi: {
    distName: 'frontend-app-deployer',
    module: 'frontend_app_deployer',
  },

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.addFields({ version });
project.gitignore.exclude(...tempDirectories);
project.npmignore?.exclude(...tempDirectories);
project.synth();