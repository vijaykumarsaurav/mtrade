def testCommand = ""
def slackUser = "@raghav"
def slackChannel = ""
def jenkins
node {
    jenkins = fileLoader.fromGit('jenkins', 'ssh://git@code.airtelworld.in:7999/infra/sandbox.git', 'master', 'raghav_tandon', '')
}
jenkins.start(testCommand, slackUser, slackChannel)