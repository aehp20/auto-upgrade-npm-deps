import { execSync } from 'child_process';

const excludeDeps = ['eslint', '@eslint/js'];

const cmdCd = "cd /Users/home/learn/github/nx-todo/nx-todo-frontend";
const cmdTarget = "ncu --target minor";

const output = execSync(`${cmdCd} && ${cmdTarget}`, { encoding: 'utf-8' });  // the default is 'buffer'

const items = output.split('\n').map(item => item.trim());

if (items.length === 4) {
  console.log('*** Nothing to update ***');
} else {
  const deps = items.filter(item => item !== '' && !item.startsWith('Checking') && !item.startsWith('Run'));
  const depNamesOrigin = deps.map(dep => dep.split(' ')[0]);
  const depNames = depNamesOrigin.filter(item => !excludeDeps.includes(item));

  if (depNames.length === 0) {
    console.log('*** Some excluded dependencies were found ***\n', depNamesOrigin);
  } else {
    console.log('*** dep names ***\n', depNames);

    let isError = false;

    for (const depName of depNames) {
      const cmdNcu = `ncu ${depName} --doctor -u`;
      const cmdGitAdd = "git add package.json package-lock.json";
      const cmdGitCommit = `git commit -m "update ${depName} dependency"`;
      try {
        const output = execSync(`${cmdCd} && ${cmdNcu} && ${cmdGitAdd} && ${cmdGitCommit}`, { encoding: 'utf-8' });
        console.log('*** output ***\n', output);
      } catch (error) {
        isError = true;
        console.error('*************');
        console.error('*** error ***\n', error);
        console.error('*************');
        break;
      }
    }

    if (!isError) {
      const cmdGitPush = "git push";
      const output = execSync(`${cmdCd} && ${cmdGitPush}`, { encoding: 'utf-8' });
      console.log('*** output ***\n', output);
    }
  }
}
